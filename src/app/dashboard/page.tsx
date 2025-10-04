// src/app/dashboard/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import PasswordGenerator from '@/components/PasswordGenerator';
import AddItemForm, { VaultItemData } from '@/components/AddItemForm';
import UnlockForm from '@/components/UnlockForm';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto';

// UPDATED: Define a simple type for the data received from the API
interface FetchedVaultItem {
  _id: string;
  userId: string;
  title: string;
  iv: string;
  encryptedData: string;
}

// UPDATED: This interface now uses the simple FetchedVaultItem type
interface DecryptedVaultItem extends FetchedVaultItem {
  decryptedData?: VaultItemData;
}


export default function Dashboard() {
  const { data: session, status } = useSession({ required: true });

  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [vaultItems, setVaultItems] = useState<DecryptedVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status]);
  
  const handleUnlock = async (masterPassword: string) => {
    if (!session?.user?.email) {
      setError('Session not found.');
      return;
    }
    try {
      setError('');
      const key = await deriveKey(masterPassword, session.user.email);
      setEncryptionKey(key);
      await fetchAndDecryptVaultItems(key);
      setIsLocked(false);
    } catch (e) {
      console.error(e);
      setError("Failed to decrypt. Please check your password.");
      throw new Error("Decryption failed");
    }
  };

  const fetchAndDecryptVaultItems = async (key: CryptoKey) => {
    const res = await fetch('/api/vault');
    const items: FetchedVaultItem[] = await res.json(); // Use the corrected simple type
    const decryptedItems = await Promise.all(
      items.map(async (item) => {
        const decryptedData = await decryptData(key, item.iv, item.encryptedData) as VaultItemData;
        return { ...item, decryptedData };
      })
    );
    setVaultItems(decryptedItems);
  };
  
  const handleSaveItem = async (itemData: VaultItemData) => {
    if (!encryptionKey) return;
    const { title, ...dataToEncrypt } = itemData;
    const { iv, encryptedData } = await encryptData(encryptionKey, dataToEncrypt);
    if (editingItem) {
      await fetch(`/api/vault/${editingItem._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, iv, encryptedData }) });
    } else {
      await fetch('/api/vault', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, iv, encryptedData }) });
    }
    closeForm();
    await fetchAndDecryptVaultItems(encryptionKey);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!encryptionKey) return;
    if (confirm('Are you sure you want to delete this item?')) {
      await fetch(`/api/vault/${itemId}`, { method: 'DELETE' });
      await fetchAndDecryptVaultItems(encryptionKey);
    }
  };
  
  const openFormToEdit = (item: DecryptedVaultItem) => { setEditingItem(item); setIsFormOpen(true); };
  const openFormToCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setEditingItem(null); setIsFormOpen(false); };

  const filteredVaultItems = vaultItems.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (status === 'loading' || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // The rest of the component's return statement remains the same...
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {isFormOpen && <AddItemForm onSave={handleSaveItem} onCancel={closeForm} initialData={editingItem ? {title: editingItem.title, ...editingItem.decryptedData} : null} />}
      {isLocked && <UnlockForm onUnlock={handleUnlock} error={error} />}
      <div className={isLocked ? 'blur-md pointer-events-none' : ''}>
        <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800 dark:border-b dark:border-gray-700">
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">Signed in as: {session?.user?.email}</div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Log Out</button>
        </header>
        <main className="container p-4 mx-auto md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome to Your Vault</h1>
          <PasswordGenerator />
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Your Saved Items</h2>
              <button onClick={openFormToCreate} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">Add New Item</button>
            </div>
            <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 mt-4 text-gray-900 bg-white border rounded-md placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"/>
            <div className="mt-4 space-y-4">
              {filteredVaultItems.map(item => (
                  <div key={item._id} className="p-4 bg-white border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200">{item.title}</h3>
                      <div className="flex space-x-2">
                        <button onClick={() => openFormToEdit(item)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600">Edit</button>
                        <button onClick={() => handleDeleteItem(item._id)} className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Username: {item.decryptedData?.username}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Password: •••••••••</p>
                  </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}