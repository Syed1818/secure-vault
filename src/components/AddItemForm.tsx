'use client';

import { useState, useEffect } from 'react';
import styles from './AddItemForm.module.css';

export interface VaultItemData {
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

interface AddItemFormProps {
  onSave: (item: VaultItemData) => Promise<void>;
  onCancel: () => void;
  initialData?: VaultItemData | null;
}

export default function AddItemForm({ onSave, onCancel, initialData }: AddItemFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave({ title, username, password, url, notes });
    setIsSubmitting(false);
  };

  const isEditing = !!initialData;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{isEditing ? 'Edit Vault Item' : 'Add New Vault Item'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input type="text" placeholder="Title (e.g., Google Account)" value={title} onChange={e => setTitle(e.target.value)} required className={styles.input} />
          <input type="text" placeholder="Username / Email" value={username} onChange={e => setUsername(e.target.value)} className={styles.input} />
          <input type="text" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} />
          <input type="url" placeholder="URL (e.g., https://google.com)" value={url} onChange={e => setUrl(e.target.value)} className={styles.input} />
          <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className={styles.textarea}></textarea>
          <div className={styles.buttonRow}>
            <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancel}`}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`${styles.button} ${styles.save}`}>{isSubmitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}