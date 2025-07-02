'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import axios, { AxiosError } from 'axios';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';
import { toast } from '@/components/ui/toast';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounceValue(username, 1000);

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const checkedUsernames = useRef<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
  
    const checkUsernameUnique = async () => {
      const usernameValue = debouncedUsername[0];
  
      if (!usernameValue || usernameValue.length < 3) {
        setUsernameMessage('');
        return;
      }
  
      // Check cache
      if (checkedUsernames.current[usernameValue]) {
        setUsernameMessage(checkedUsernames.current[usernameValue] as string);
        return;
      }
  
      setIsCheckingUsername(true);
  
      try {
        const response = await axios.get(`/api/check-username-unique?username=${usernameValue}`);
        if (isMounted) {
            let message = response.data.message;

            if(response.data.success){
                message = 'Username is unique';
                setUsernameMessage(message);
            }else{
                message = 'Username is not unique';
                setUsernameMessage(message);
            }

            checkedUsernames.current[usernameValue] = message;
            console.log("usernameMessage : " ,usernameMessage , "message : " , message);
            console.log("checkedUsernames.current : " , checkedUsernames.current);
        } 
      } catch (error) {
        if (isMounted) {
          setUsernameMessage('Error checking username');
        }
      } finally {
        if (isMounted) {
          setIsCheckingUsername(false);
        }
      }
    };
  
    checkUsernameUnique();
  
    return () => {
      isMounted = false;
    };
  }, [debouncedUsername]);
  


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace(`/verify/${data.username}`);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message || 
        'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Feedback-Hub
          </h1>
          <p className="mb-4 text-gray-600">Create an account to start your anonymous adventure</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(e);
                        setUsername(value);
                        
                        // Clear message when empty or too short
                        if (!value || value.length < 3) {
                          setUsernameMessage('');
                        }
                      }}
                      className={
                        usernameMessage === 'Username is unique'
                          ? 'pr-10 border-green-500'
                          : usernameMessage && usernameMessage !== 'Username is unique'
                          ? 'pr-10 border-red-500'
                          : 'pr-10'
                      }
                    />
                    {isCheckingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!isCheckingUsername && usernameMessage === 'Username is unique' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    {!isCheckingUsername && usernameMessage && usernameMessage !== 'Username is unique' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  {username && username.length < 3 && (
                    <p className="text-sm mt-1 text-amber-500">
                      Username must be at least 3 characters
                    </p>
                  )}
                  
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm mt-1 ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className='text-gray-500 text-sm mt-1'>We'll send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <p className='text-gray-500 text-sm mt-1'>At least 6 characters</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className='w-full' 
              disabled={
                isSubmitting || 
                isCheckingUsername || 
                (username.length >= 3 && usernameMessage !== 'Username is unique')
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            

          </form>
        </Form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 