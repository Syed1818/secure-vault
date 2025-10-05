'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Secure Vault</h1>
      <p className={styles.description}>
        A simple, fast, and privacy-first password manager.
      </p>

      <div className={styles.buttonContainer}>
        {status === 'loading' ? (
          <p>Loading...</p>
        ) : session ? (
          <Link href="/dashboard" className={`${styles.button} ${styles.primary}`}>
            Go to Your Vault
          </Link>
        ) : (
          <>
            <Link href="/login" className={`${styles.button} ${styles.primary}`}>
              Log In
            </Link>
            <Link href="/signup" className={`${styles.button} ${styles.secondary}`}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
