'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import PasswordGenerator from '@/components/PasswordGenerator';
import AddItemForm, { VaultItemData } from '@/components/AddItemForm';
import UnlockForm from '@/components/UnlockForm';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto';
import { Search, Plus, LogOut, Edit2, Trash2 } from 'lucide-react';

interface FetchedVaultItem {
  _id: string;
  userId: string;
  title: string;
  iv: string;
  encryptedData: string;
}

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
    if (status === 'authenticated') setIsLoading(false);
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
    const items: FetchedVaultItem[] = await res.json();
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
      await fetch(`/api/vault/${editingItem._id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, iv, encryptedData })
      });
    } else {
      await fetch('/api/vault', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, iv, encryptedData })
      });
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

  const openFormToEdit = (item: DecryptedVaultItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  const openFormToCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const filteredVaultItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-300">
        Loading your vault...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {isFormOpen && (
        <AddItemForm
          onSave={handleSaveItem}
          onCancel={closeForm}
          initialData={editingItem ? { title: editingItem.title, ...editingItem.decryptedData } : null}
        />
      )}
      {isLocked && <UnlockForm onUnlock={handleUnlock} error={error} />}
      <div className={isLocked ? 'blur-md pointer-events-none' : ''}>
        
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b dark:bg-gray-900/90 dark:border-gray-700">
          <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
            Signed in as <span className="font-semibold">{session?.user?.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </header>

        {/* MAIN */}
        <main className="container p-6 mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-6">🔐 Your Vault</h1>
          <PasswordGenerator />

          {/* Search + Add */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 gap-4">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={openFormToCreate}
              className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* ITEMS */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredVaultItems.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl bg-white border shadow-sm hover:shadow-md transition dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openFormToEdit(item)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Username: {item.decryptedData?.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Password: •••••••••
                </p>
              </div>
            ))}
          </div>

          {filteredVaultItems.length === 0 && (
            <p className="mt-6 text-center text-gray-500 dark:text-gray-400">
              No items found. Try adding one!
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
