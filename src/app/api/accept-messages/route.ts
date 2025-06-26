import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';

export async function POST(request: NextRequest) {

    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session?.user as User;

        const userId = user._id;
        
        const {acceptMeessages} = await request.json();

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            $push: {
                isAcceptingMessages: acceptMeessages
            }, 
        }, {new: true});

        if (!updatedUser) {
            return Response.json({ 
                success: false,
                message: 'User not found'
             }, { status: 404 });
        }


        return Response.json({  
            success: true,
            message: 'Message accepted successfully'
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error accepting message:', error);
        return Response.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest){
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session?.user as User)._id;

        const user = await UserModel.findById(userId) as User;

        if (!user) {
            return Response.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            isAcceptingMessages: user.isAcceptingMessages
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error getting user:', error);
        return Response.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}