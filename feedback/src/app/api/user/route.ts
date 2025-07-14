import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = (session.user as User)._id;

    // Fetch user details excluding sensitive information and messages
    const user = await UserModel.findById(userId).select('-password -verifyCode -verifyCodeExpiry -messages');

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isAcceptingMessages: user.isAcceptingMessages,
        messagesCount: user.messages?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
} 