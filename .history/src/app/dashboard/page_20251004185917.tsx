// src/app/dashboard/page.tsx

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PasswordGenerator from '@/components/PasswordGenerator'; // <-- 1. IMPORT

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <div className="text-lg font-semibold text-gray-600">
          Signed in as: {session?.user?.email}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Log Out
        </button>
      </header>
      
      <main className="container p-4 mx-auto md:p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to Your Vault
        </h1>
        
        {/* 2. ADD THE COMPONENT HERE */}
        <PasswordGenerator /> 

      </main>
    </div>
  );
}