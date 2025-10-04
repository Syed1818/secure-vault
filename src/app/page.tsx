// src/app/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
        Secure Vault
      </h1>
      <p className="max-w-md mx-auto mt-3 text-base text-center text-gray-500 md:mt-5 md:text-lg md:max-w-xl dark:text-gray-400">
        A simple, fast, and privacy-first password manager.
      </p>

      <div className="mt-8">
        {status === 'loading' ? (
          <p>Loading...</p>
        ) : session ? (
          <Link
            href="/dashboard"
            className="px-8 py-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Go to Your Vault
          </Link>
        ) : (
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-8 py-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}