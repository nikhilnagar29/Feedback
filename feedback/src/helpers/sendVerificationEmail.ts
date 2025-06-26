import {resend} from '@/lib/resend';

import VerificationEmail from '../../emails/VerificationEmail';

import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  VerifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to : email,
        subject : 'Feedback Message Verification Code' ,
        react: VerificationEmail({
            username,
            otp: VerifyCode,
        })
    }) ;

    return {
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.',
    };
    
  } catch (emailError){
        console.error('Error sending verification email:', emailError);
        return {
            success: false,
            message: 'Failed to send verification email. Please try again later.',
        };
  }
}


