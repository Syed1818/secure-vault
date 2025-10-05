'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'; // Removed useRef
import { useSession, signOut } from 'next-auth/react';
import PasswordGenerator from '@/components/PasswordGenerator';
import AddItemForm, { VaultItemData } from '@/components/AddItemForm';
import UnlockForm from '@/components/UnlockForm';
import { useTheme } from '@/components/ThemeProvider';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto';
import styles from './dashboard.module.css';
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
  const { theme, toggleTheme } = useTheme();

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
    try {
      const res = await fetch('/api/vault');
      if (!res.ok) {
        throw new Error('Failed to fetch vault items');
      }
      const items: FetchedVaultItem[] = await res.json();
      const decryptedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const decryptedData = await decryptData(key, item.iv, item.encryptedData) as VaultItemData;
            return { ...item, decryptedData };
          } catch (error) {
            console.error('Failed to decrypt item:', item._id, error);
            return { ...item, decryptedData: undefined };
          }
        })
      );
      setVaultItems(decryptedItems.filter(item => item.decryptedData !== undefined));
    } catch (error) {
      console.error('Error fetching vault items:', error);
      setError('Failed to load vault items');
    }
  };
  
  const handleSaveItem = async (itemData: VaultItemData) => {
    if (!encryptionKey) return;
    
    try {
      const { title, ...dataToEncrypt } = itemData;
      const { iv, encryptedData } = await encryptData(encryptionKey, dataToEncrypt);
      
      if (editingItem) {
        const response = await fetch(`/api/vault/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, iv, encryptedData })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update item');
        }
      } else {
        const response = await fetch('/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, iv, encryptedData })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create item');
        }
      }
      
      closeForm();
      await fetchAndDecryptVaultItems(encryptionKey);
    } catch (error) {
      console.error('Error saving item:', error);
      setError('Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!encryptionKey) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/vault/${itemId}`, { method: 'DELETE' });
        
        if (!response.ok) {
          throw new Error('Failed to delete item');
        }
        
        await fetchAndDecryptVaultItems(encryptionKey);
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item');
      }
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
    setError('');
  };

  const filteredVaultItems = vaultItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      {isFormOpen && (
        <AddItemForm 
          onSave={handleSaveItem} 
          onCancel={closeForm} 
          initialData={editingItem ? { title: editingItem.title, ...editingItem.decryptedData } : null} 
        />
      )}
      {isLocked && <UnlockForm onUnlock={handleUnlock} error={error} />}
      
      <div className={isLocked ? styles.blur : ''}>
        <header className={styles.header}>
          <div className={styles.headerInfo}>Signed in as: {session?.user?.email}</div>
          <div className={styles.headerActions}>
            <button onClick={toggleTheme} className={`${styles.button} ${styles.themeButton}`}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button onClick={() => signOut({ callbackUrl: '/' })} className={`${styles.button} ${styles.logoutButton}`}>
              Log Out
            </button>
          </div>
        </header>
        
        <main className={styles.main}>
          <h1 className={styles.mainTitle}>Welcome to Your Vault</h1>
          
          <PasswordGenerator />
          
          <div className={styles.vaultSection}>
            <div className={styles.vaultHeader}>
              <h2 className={styles.vaultTitle}>Your Saved Items</h2>
              <button onClick={openFormToCreate} className={`${styles.button} ${styles.primaryButton}`}>
                Add New Item
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className={styles.searchBar}
            />
            
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.vaultList}>
              {filteredVaultItems.length === 0 ? (
                <div className={styles.emptyState}>
                  {vaultItems.length === 0 ? 'No items in your vault yet.' : 'No items match your search.'}
                </div>
              ) : (
                filteredVaultItems.map(item => (
                  <div key={item._id} className={styles.vaultItem}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <div className={styles.itemActions}>
                        <button onClick={() => openFormToEdit(item)} className={`${styles.button} ${styles.editButton}`}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteItem(item._id)} className={`${styles.button} ${styles.deleteButton}`}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className={styles.itemInfo}>Username: {item.decryptedData?.username}</p>
                    <p className={styles.itemInfo}>Password: •••••••••</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}