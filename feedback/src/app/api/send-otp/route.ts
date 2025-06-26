import { NextRequest, NextResponse } from 'next/server';

// Mail server URL
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const { email, username, otp } = await req.json();
    
    if (!email || !username || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email, username, and OTP are required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the mail server
    const response = await fetch(`${MAIL_SERVER_URL}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, otp }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to queue email' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP email has been queued',
      jobId: data.jobId,
    });
    
  } catch (error) {
    console.error('Error sending OTP request to mail server:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
} 