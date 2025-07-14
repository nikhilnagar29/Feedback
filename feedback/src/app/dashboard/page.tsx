'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Loader2, Settings, User, MessageSquare, LogOut, ChevronLeft, ChevronRight, Link, Link2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

interface Message {
  _id: string;
  content: string;
  createdAt: string;
}

interface UserDetails {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messagesCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messageAcceptance, setMessageAcceptance] = useState(true);
  const [messageLink, setMessageLink] = useState('');


  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'unauthenticated') {
      router.push('/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    const checkQueueServer = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/call-queue-server`);
      const data = await response.json();
      console.log('queue server is running', data.message);
    }
    checkQueueServer();
  }, []);


  // Fetch user details
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'authenticated') {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch('/api/user');
          const data = await response.json();
          
          if (data.success) {
            setUserDetails(data.user);
            setMessageAcceptance(data.user.isAcceptingMessages);
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            setMessageLink(`${baseUrl}/message/${data.user.username}`);
            // Save username to localStorage
            if (data.user.username) {
              localStorage.setItem('username', data.user.username);
            }
          } else {
            toast({
              title: 'Error',
              description: data.message || 'Failed to fetch user details',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch user details',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingUser(false);
        }
      };
      
      fetchUserDetails();
    }
  }, [status]);

  // Fetch messages
  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/get-messages?page=${pagination.page}&limit=${pagination.limit}`);
      const data = await response.json();

      
      if (data.success) {
        
        setMessages(data.messages);
        setPagination(data.pagination);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch messages',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const messageAcceptanceMutation = async () => {
    try {
      const response = await fetch('/api/accept-messages', {
        method: 'POST',
        body: JSON.stringify({ acceptMeessages : !messageAcceptance }),
      });

      const data = await response.json();
      if(data.success){
        setMessageAcceptance(data.isAcceptingMessages);
      }
    } catch (error) {
      console.error('Error accepting messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept messages',
        variant: 'destructive',
      });
    }
  };

  // Fetch messages when pagination changes
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'authenticated') {
      fetchMessages();
    }
  }, [pagination.page, pagination.limit, status]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({ ...prev, page: 1, limit: parseInt(newLimit) }));
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/sign-in' });
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback if signOut fails
      router.push('/sign-in');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Show loading state during initial load or when checking authentication
  if (status === 'loading' || isLoadingUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Top Section: User Profile and Message Link */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Profile Card */}
          <Card className="lg:col-span-1.5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userDetails ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="font-medium">{userDetails.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="font-medium">{userDetails.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Verification Status</p>
                    <div className="flex items-center">
                      <span className={`inline-block h-2 w-2 rounded-full mr-2 ${userDetails.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p>{userDetails.isVerified ? 'Verified' : 'Not Verified'}</p>
                    </div>
                  </div>
                  
                </>
              ) : (
                <p className="text-gray-500">Failed to load user details</p>
              )}
            </CardContent>
         
          </Card>

          {/* Message Link Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Link2 className="h-5 w-5 mr-2" />
                    Your Message Link
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-2">Share this link with your users to receive feedback</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center flex items-center justify-center">
                <p className="text-gray-500">{messageLink}</p>
                <Copy className="h-4 w-4 cursor-pointer ml-3" onClick={() => {
                  navigator.clipboard.writeText(messageLink);
                  toast({
                    title: 'Copied to clipboard',
                    description: 'Link copied to clipboard',
                  });
                }} />
              </div>
              {userDetails ? (
                <>
                  
                  
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Accepting Messages</p>
                    <div className="flex items-center">
                      <span className={`inline-block h-2 w-2 rounded-full mr-2 ${messageAcceptance ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p>{messageAcceptance ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Total Messages</p>
                    <p className="font-medium">{messages.length}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Failed to load user details</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {
                messageAcceptanceMutation();
              }}>
                {messageAcceptance ? 'Stop Accepting Messages' : 'Start Accepting Messages'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Bottom Section: Messages */}
        <div className="grid grid-cols-1 gap-8">
          {/* Messages Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </CardTitle>
                  <CardDescription>Your received messages</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Show:</span>
                  <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message._id} className="p-4 border rounded-lg bg-white shadow-sm">
                      <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(message.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages yet</p>
                </div>
              )}
            </CardContent>
            {pagination.pages > 1 && (
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {pagination.page} of {pagination.pages} pages
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 