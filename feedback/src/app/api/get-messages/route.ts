import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        // Get pagination parameters from URL
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const page = parseInt(url.searchParams.get('page') || '1');
        
        // Validate pagination parameters
        const validLimit = [10, 25, 100].includes(limit) ? limit : 10;
        const validPage = page > 0 ? page : 1;
        const skip = (validPage - 1) * validLimit;

        const userId = new mongoose.Types.ObjectId((session.user as User)._id);

        // Get total count of messages
        const userWithCount = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $project: { messageCount: { $size: '$messages' } } }
        ]);
        
        const totalMessages = userWithCount.length > 0 ? userWithCount[0].messageCount : 0;
        const totalPages = Math.ceil(totalMessages / validLimit);

        // Get paginated messages sorted by createdAt in descending order
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
            { $sort: { 'messages.createdAt': -1 } },
            { $skip: skip },
            { $limit: validLimit },
            { $group: {
                _id: '$_id',
                messages: { $push: '$messages' }
            }}
        ]);
        
        if (!user || user.length === 0) {
            return Response.json({
                success: true,
                messages: [],
                pagination: {
                    total: 0,
                    page: validPage,
                    limit: validLimit,
                    pages: 0
                }
            }, { status: 200 });
        }
        
        return Response.json({
            success: true,
            messages: user[0].messages || [],
            pagination: {
                total: totalMessages,
                page: validPage,
                limit: validLimit,
                pages: totalPages
            }
        }, { status: 200 });
    }
    
    catch (error) {
        console.error('Error getting messages:', error);
        return Response.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}