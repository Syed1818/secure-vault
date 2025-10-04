// src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PasswordGenerator from '@/components/PasswordGenerator';
import AddItemForm from '@/components/AddItemForm';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto';
import type { IVaultItem } from '@/models/VaultItem';

interface DecryptedVaultItem extends IVaultItem {
  decryptedData?: { username?: string; password?: string; url?: string; notes?: string };
}

export default function Dashboard() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();

  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [vaultItems, setVaultItems] = useState<DecryptedVaultItem[]>([]);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect to derive the key and fetch items once the session is loaded
  useEffect(() => {
    async function initializeVault() {
      if (session?.user?.email) {
        try {
          // In a real app, you'd prompt the user for their master password here.
          // For this MVP, we'll re-use their login password for key derivation.
          // This is a simplification; a dedicated master password is more secure.
          const masterPassword = prompt("Please enter your master password to unlock the vault:");
          if (!masterPassword) {
            setError("Master password is required to access the vault.");
            setIsLoading(false);
            return;
          }
          
          const key = await deriveKey(masterPassword, session.user.email);
          setEncryptionKey(key);
          await fetchAndDecryptVaultItems(key);
        } catch (e) {
          setError("Failed to unlock vault. Please check your password and try again.");
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (status === 'authenticated') {
      initializeVault();
    }
  }, [status, session]);

  const fetchAndDecryptVaultItems = async (key: CryptoKey) => {
    const res = await fetch('/api/vault');
    const items: IVaultItem[] = await res.json();
    
    const decryptedItems = await Promise.all(
      items.map(async (item) => {
        const decryptedData = await decryptData(key, item.iv, item.encryptedData);
        return { ...item, decryptedData };
      })
    );
    setVaultItems(decryptedItems);
  };

  const handleAddItem = async (item: { title: string; username?: string; password?: string; url?: string; notes?: string }) => {
    if (!encryptionKey) {
      alert("Vault is not unlocked. Cannot save item.");
      return;
    }
    
    const { title, ...dataToEncrypt } = item;
    const { iv, encryptedData } = await encryptData(encryptionKey, dataToEncrypt);
    
    await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, iv, encryptedData }),
    });
    
    setShowAddItemForm(false);
    await fetchAndDecryptVaultItems(encryptionKey); // Refresh the list
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading vault...</div>;
  }
  
  if (error) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center">
         <p className="text-xl text-red-600">{error}</p>
         <button onClick={() => window.location.reload()} className="px-4 py-2 mt-4 text-white bg-indigo-600 rounded">Retry</button>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showAddItemForm && <AddItemForm onAddItem={handleAddItem} onCancel={() => setShowAddItemForm(false)} />}
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <div className="text-lg font-semibold text-gray-600">Signed in as: {session?.user?.email}</div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Log Out</button>
      </header>
      <main className="container p-4 mx-auto md:p-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Your Vault</h1>
        <PasswordGenerator />

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Saved Items</h2>
            <button onClick={() => setShowAddItemForm(true)} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add New Item</button>
          </div>
          <div className="mt-4 space-y-4">
            {vaultItems.length === 0 ? (
              <p>You have no saved items yet.</p>
            ) : (
              vaultItems.map(item => (
                <div key={item._id} className="p-4 bg-white border rounded-lg shadow">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-600">Username: {item.decryptedData?.username}</p>
                  <p className="text-sm text-gray-600">Password: •••••••••</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}