
import { NextRequest, NextResponse } from 'next/server';

// Mail server URL
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';

export async function GET() {
  try {
   
    // Forward the request to the mail server
    const response = await fetch(`${MAIL_SERVER_URL}/api/check`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error checking job status from mail server:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
}
