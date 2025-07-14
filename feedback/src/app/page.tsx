'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      if (status === 'authenticated') {
        router.push('/dashboard');
      } else if (status === 'unauthenticated') {
        router.push('/sign-in');
      }
    }
  }, [status, router]);

  // Return a simple loading UI that can be rendered on the server
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
}