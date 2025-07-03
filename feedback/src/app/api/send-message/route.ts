import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';


// Mail server URL for the queue
const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'http://localhost:3001';




export async function POST(request: Request) {
   
    try {
       
        await dbConnect();

        const { username, content } = await request.json();

        if (!username || !content) {
            return NextResponse.json({
                success: false,
                message: 'Username and content are required',
            }, { status: 400 });
        }

        // Check if user exists and is accepting messages
        const user = await UserModel.findOne({ username });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found',
            }, { status: 404 });
        }

        if (!user.isAcceptingMessages) {
            return NextResponse.json({
                success: false,
                message: 'User is not accepting messages',
            }, { status: 403 });
        }

        // Queue the message for saving
        const response = await fetch(`${MAIL_SERVER_URL}/api/save-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                content,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: result.message || 'Failed to queue message',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Message queued successfully',
            jobId: result.jobId,
        });
    } catch (error: unknown) {
        // Check if error is a rate limit error
        const rateLimitError = error as { code?: number; data?: any };
        if (rateLimitError.code === 429) {
            return NextResponse.json(rateLimitError.data, { status: 429 });
        }

        console.error('Error processing message request:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
        }, { status: 500 });
    }
}
