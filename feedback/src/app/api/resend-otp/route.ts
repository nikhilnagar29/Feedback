import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import crypto from 'crypto';

// Mail server URL
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email } = await req.json();


    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find the user by email
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'User is already verified' },
        { status: 400 }
      );
    }
    
    // Generate a new 6-digit OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    
    // Set expiry time (10 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);
    
    // Update user with new OTP and expiry
    user.verifyCode = newOtp;
    user.verifyCodeExpiry = expiryTime;
    await user.save();
    
    // Queue the OTP email using mail server
    try {
      const response = await fetch(`${MAIL_SERVER_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          otp: newOtp,
        }),
      });
      
      const emailResult = await response.json();
      
      if (!emailResult.success) {
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP email' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'OTP has been sent to your email',
        jobId: emailResult.jobId,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 