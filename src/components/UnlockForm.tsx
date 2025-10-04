'use client';

import { useState } from 'react';

interface UnlockFormProps {
  onUnlock: (password: string) => Promise<void>;
  error?: string;
}

export default function UnlockForm({ onUnlock, error }: UnlockFormProps) {
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    try {
      await onUnlock(password);
    } catch (e) {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-200">Unlock Your Vault</h2>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Enter your master password to decrypt your saved items.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input id="master-password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Master Password" className="w-full px-3 py-2 text-gray-900 border rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <button type="submit" disabled={isUnlocking} className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}