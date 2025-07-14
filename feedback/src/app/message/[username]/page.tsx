'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Check, AlertCircle, Heart, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function MessagePage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [animation, setAnimation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(false);
  const MAX_CHARS = 1000;
  const username = decodeURIComponent(params.username);

  // Check if user exists and is accepting messages
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(`/api/check-user?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (data.success) {

          setUserExists(true);
          setIsAcceptingMessages(data.isAcceptingMessages);
        } else {
          setUserExists(false);
        }
      } catch (err) {
        console.error('Error checking user:', err);
        setUserExists(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [username]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      setAnimation('shake');
      setTimeout(() => setAnimation(''), 500);
      return;
    }
    
    if (message.length > MAX_CHARS) {
      setError(`Message is too long (max ${MAX_CHARS} characters)`);
      setAnimation('shake');
      setTimeout(() => setAnimation(''), 500);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          content: message,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        setMessage('');
      } else {
        setError(data.message || 'Failed to send message');
        setAnimation('shake');
        setTimeout(() => setAnimation(''), 500);
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
      console.error('Error sending message:', err);
      setAnimation('shake');
      setTimeout(() => setAnimation(''), 500);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="flex items-center text-2xl">
              <MessageSquare className="mr-2 h-6 w-6" />
              Send Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Checking user information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not found
  if (!userExists) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardTitle className="flex items-center text-2xl">
              <XCircle className="mr-2 h-6 w-6" />
              User Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 mb-6">
              The user <span className="font-semibold">{username}</span> was not found.
            </p>
            <Button 
              onClick={() => window.close()}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not accepting messages
  if (!isAcceptingMessages) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <CardTitle className="flex items-center text-2xl">
              <AlertCircle className="mr-2 h-6 w-6" />
              Not Accepting Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 mb-6">
              <span className="font-semibold">{username}</span> is not currently accepting messages.
            </p>
            <Button 
              onClick={() => window.close()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
      <Card 
        className={`w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 ${animation}`}
        style={{
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)'
        }}
      >
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="flex items-center text-2xl">
            <MessageSquare className="mr-2 h-6 w-6" />
            Send Feedback to {username}
          </CardTitle>
          <CardDescription className="text-blue-100">
            Your message will be anonymous
          </CardDescription>
        </CardHeader>
        
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4 animate-bounce">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-500 mb-6">
              Your message has been sent successfully.
            </p>
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={() => setIsSuccess(false)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Send another message
              </Button>
              <Button 
                onClick={() => window.close()}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Your Message
                </label>
                <Textarea
                  placeholder="Write your feedback here..."
                  className="min-h-[150px] resize-none border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="flex justify-between items-center text-sm">
                  <div className={`${charCount > MAX_CHARS ? 'text-red-500' : 'text-gray-500'} transition-colors duration-200`}>
                    {charCount}/{MAX_CHARS} characters
                  </div>
                  {error && (
                    <div className="flex items-center text-red-500 animate-pulse">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-6 py-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting || message.length > MAX_CHARS}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
      
      <div className="mt-8 text-center text-gray-500 text-sm flex items-center justify-center">
        <span>Powered by Feedback Hub</span>
        <Heart className="h-3 w-3 ml-1 text-red-400" fill="currentColor" />
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}

