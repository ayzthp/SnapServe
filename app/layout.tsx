"use client";
import './globals.css'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        setUserType(userData?.userType);

        // Implement role-based access control
        if (userData?.userType === 'customer' && pathname === '/provider-dashboard') {
          router.push('/customer-dashboard');
        } else if (userData?.userType === 'provider' && pathname === '/customer-dashboard') {
          router.push('/provider-dashboard');
        }
      } else {
        setUser(null);
        setUserType(null);
        if (!['/signin', '/signup', '/'].includes(pathname)) {
          router.push('/signin');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
              Service Request App
            </Link>
            {user ? (
              <div className="space-x-4">
                {userType === 'customer' && (
                  <Link href="/customer-dashboard" className="hover:text-blue-200 transition-colors">
                    Customer Dashboard
                  </Link>
                )}
                {userType === 'provider' && (
                  <Link href="/provider-dashboard" className="hover:text-blue-200 transition-colors">
                    Provider Dashboard
                  </Link>
                )}
                <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/signin" className="hover:text-blue-200 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
        <main className="flex-grow">{children}</main>
        <footer className="bg-gray-800 text-white py-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2023 Service Request App. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

