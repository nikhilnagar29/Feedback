import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import crypto from 'crypto';

// Mail server URL
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { username, email, password } = await req.json();
    
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: existingUser.email === email 
            ? 'Email already in use' 
            : 'Username already taken' 
        },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate OTP
    const verifyCode = crypto.randomInt(100000, 999999).toString();
    
    // Set expiry time (10 minutes from now)
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setMinutes(verifyCodeExpiry.getMinutes() + 10);
    
    // Create user
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry,
      isVerified: false,
      isAcceptingMessages: true,
    });
    
    // Queue OTP email using mail server
    try {
      const response = await fetch(`${MAIL_SERVER_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          otp: verifyCode,
        }),
      });
      
      const emailResult = await response.json();
      console.log('OTP email queued:', emailResult);
      
      if (!emailResult.success) {
        console.error('Failed to queue OTP email');
      }
    } catch (emailError) {
      console.error('Error queuing OTP email:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      userId: newUser._id?.toString() || newUser.id,
    });
    
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
} 