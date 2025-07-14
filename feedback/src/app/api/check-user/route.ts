import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({
        success: false,
        message: 'Username is required',
      }, { status: 400 });
    }
    
    const user = await UserModel.findOne({ username });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      isAcceptingMessages: user.isAcceptingMessages,
      username: user.username,
    });
    
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
} 