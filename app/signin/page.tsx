'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomerSignIn from '@/components/CustomerSignIn';
import ProviderSignIn from '@/components/ProviderSignIn';
import { auth } from '@/lib/firebase';

export default function SignInPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, redirect to the appropriate dashboard
        router.push('/customer-dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Sign In to Service Request App
        </h1>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              I am a:
            </label>
            <div className="flex justify-center space-x-4">
              <button
                className={`px-4 py-2 rounded ${userType === 'customer' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUserType('customer')}
              >
                Customer
              </button>
              <button
                className={`px-4 py-2 rounded ${userType === 'provider' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setUserType('provider')}
              >
                Service Provider
              </button>
            </div>
          </div>
          {userType === 'customer' ? <CustomerSignIn /> : <ProviderSignIn />}
          <div className="mt-4 text-center">
            Don't have an account? <Link href="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

