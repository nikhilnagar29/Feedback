// @ts-nocheck
// TODO: Fix TypeScript types properly in a future update
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel, { User } from '@/model/User';

// Mail server URL for the queue
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';

export const authOptions: NextAuthOptions = { 
  providers: [
    
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        await dbConnect();
        try {
          // Include password in the query result by using select('+password')
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          }).select('+password');
          
          if (!user) {
            throw new Error('No user found with this email or username');
          }
          
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          
          // Check if password exists in the user object
          if (!user.password) {
            console.error('Password field is missing from user object');
            throw new Error('Authentication failed. Please contact support.');
          }
          
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: unknown) {
          const error = err as Error;
          console.error('Authentication error:', error);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  events: {
    // Custom event handler for sending verification OTP
    async createUser({ user }) {
      // This would be called when a user is created
      // Queue the OTP email using the mail server
      if (user.email && user.username && user.verifyCode) {
        try {
          // Send the OTP email request to the mail server queue
          const response = await fetch(`${MAIL_SERVER_URL}/api/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              username: user.username,
              otp: user.verifyCode
            }),
          });
          
          const result = await response.json();
          console.log('OTP email queued:', result);
        } catch (error) {
          console.error('Failed to queue OTP email:', error);
        }
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};

