'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';  
import { ApiResponse } from '@/types/ApiResponse';

const verifySchema = z.object({
  otp: z.string().min(4, { message: 'OTP must be at least 4 characters' }),
});

export default function VerifyPage({ params }: { params: { username: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const username = decodeURIComponent(params.username);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          code: data.otp,
        }),
      });

      const result = await response.json() as ApiResponse;
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        router.push('/sign-in');
      } else {
        toast({
          title: 'Verification Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during verification:', error);
      toast({
        title: 'Verification Failed',
        description: 'There was a problem verifying your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const result = await response.json() as ApiResponse;
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: 'Error',
        description: 'There was a problem sending the verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Email
          </h1>
          <p className="mb-6 text-gray-600">
            We&apos;ve sent a verification code to <span className="font-medium">{username}</span>. 
            Please enter the code below to verify your account.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="otp"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input 
                    {...field} 
                    placeholder="Enter your verification code" 
                    className="text-center text-xl tracking-widest" 
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Account'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-gray-600 mb-4">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="outline"
            onClick={handleResendOTP}
            disabled={isResending}
            className="mx-auto"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Verification Code'
            )}
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 