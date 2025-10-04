// src/app/dashboard/page.tsx

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true, // This enforces authentication, redirecting if not logged in
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
      router.push('/login');
    },
  });
  const router = useRouter();

  // The loading state is handled by the `status` property
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If session is authenticated, render the dashboard
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to Your Vault
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Signed in as: <span className="font-semibold">{session?.user?.email}</span>
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/' })} // Sign out and redirect to home
          className="px-6 py-2 mt-8 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}