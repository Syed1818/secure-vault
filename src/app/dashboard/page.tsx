'use client';

import React, { useEffect, useState } from 'react';
import VaultItemCard from '@/components/VaultItemCard';
import UnlockForm from '@/components/UnlockForm';
import AddItemForm, { VaultItemData } from '@/components/AddItemForm';
import { useSession } from 'next-auth/react';
import '@/styles/vault.css';
import '@/styles/unlock.css';
import '@/styles/AddItemForm.module.css';

interface VaultItem {
  _id: string;
  title: string;
  iv: string;
  encryptedData: string;
}

const Dashboard: React.FC = () => {
  const { data: session } = useSession();
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch vault items
  useEffect(() => {
    const fetchVaultItems = async () => {
      const res = await fetch('/api/vault');
      if (res.ok) {
        const data: VaultItem[] = await res.json();
        setVaultItems(data);
      }
    };
    fetchVaultItems();
  }, []);

  // Delete vault item
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/vault/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setVaultItems(vaultItems.filter((item) => item._id !== id));
    }
  };

  // Add new vault item
  const handleSave = async (itemData: VaultItemData) => {
    // Here you would encrypt itemData before sending
    const iv = 'dummy-iv'; // replace with real IV
    const encryptedData = 'dummy-encrypted'; // replace with real encryption
    const res = await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: itemData.title, iv, encryptedData }),
    });

    if (res.ok) {
      const newItem: VaultItem = await res.json();
      setVaultItems([...vaultItems, newItem]);
      setShowAddForm(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Your Vault</h1>
      <button onClick={() => setShowAddForm(true)}>Add New Vault Item</button>

      {vaultItems.map((item) => (
        <VaultItemCard
          key={item._id}
          title={item.title}
          onUnlock={() => setSelectedItem(item)}
          onDelete={() => handleDelete(item._id)}
        />
      ))}

      {selectedItem && (
        <UnlockForm
          encryptedData={selectedItem.encryptedData}
          iv={selectedItem.iv}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {showAddForm && (
        <AddItemForm
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
