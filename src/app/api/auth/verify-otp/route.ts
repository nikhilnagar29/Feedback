import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email, otp } = await req.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
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
        { success: true, message: 'User is already verified' },
        { status: 200 }
      );
    }
    
    // Check if OTP is valid
    if (user.verifyCode !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }
    
    // Check if OTP has expired
    const now = new Date();
    if (now > user.verifyCodeExpiry) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      );
    }
    
    // Mark user as verified
    user.isVerified = true;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 