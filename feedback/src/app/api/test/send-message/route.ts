import {  NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel, { Message } from '@/model/User';




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

        // Add the message directly without type casting
        user.messages.push({ content } as Message);
        await user.save();

        
        return NextResponse.json({
            success: true,
            message: 'Message saved successfully in database',
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
