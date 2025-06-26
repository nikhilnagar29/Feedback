import { NextRequest, NextResponse } from 'next/server';

// Mail server URL
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, message: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the mail server
    const response = await fetch(`${MAIL_SERVER_URL}/api/job-status/${jobId}`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to get job status' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error checking job status from mail server:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
} 