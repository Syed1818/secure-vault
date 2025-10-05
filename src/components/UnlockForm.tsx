'use client';

import { useState } from 'react';
import styles from './UnlockForm.module.css';

interface UnlockFormProps {
  onUnlock: (password: string) => Promise<void>;
  error?: string;
}

export default function UnlockForm({ onUnlock, error }: UnlockFormProps) {
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUnlocking(true);
    try {
      await onUnlock(password);
    } catch (err) {
      console.error(err); // Use the error variable
      setIsUnlocking(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.formBox}>
        <h2 className={styles.title}>Unlock Your Vault</h2>
        <p className={styles.description}>
          Enter your master password to decrypt your saved items.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            id="master-password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master Password"
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            disabled={isUnlocking}
            className={styles.submitButton}
            style={{marginTop: '1rem'}}
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}