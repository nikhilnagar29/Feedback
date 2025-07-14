import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      {
        success: false,
        message: 'This endpoint is only available in development mode',
      },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    const { username, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      // If user exists but isn't verified, verify them
      if (!existingUser.isVerified) {
        existingUser.isVerified = true;
        await existingUser.save();
        
        return Response.json(
          {
            success: true,
            message: 'Existing user has been verified for testing',
          },
          { status: 200 }
        );
      }
      
      return Response.json(
        {
          success: false,
          message: 'User already exists',
        },
        { status: 400 }
      );
    }

    // Create new verified user
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = '123456'; // Test verification code
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry: expiryDate,
      isVerified: true, // User is already verified
      isAcceptingMessages: true,
      messages: [],
    });

    await newUser.save();

    return Response.json(
      {
        success: true,
        message: 'Test user created and verified successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating test user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error creating test user',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
} 