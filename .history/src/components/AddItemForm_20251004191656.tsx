// src/components/AddItemForm.tsx

'use client';

import { useState } from 'react';

interface AddItemFormProps {
  onAddItem: (item: { title: string, username?: string, password?: string, url?: string, notes?: string }) => Promise<void>;
  onCancel: () => void;
}

export default function AddItemForm({ onAddItem, onCancel }: AddItemFormProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAddItem({ title, username, password, url, notes });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Add New Vault Item</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input 
            type="text" 
            placeholder="Title (e.g., Google Account)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            className="w-full p-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <input 
            type="text" 
            placeholder="Username / Email" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="w-full p-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <input 
            type="url" 
            placeholder="URL (e.g., https://google.com)" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            className="w-full p-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <textarea 
            placeholder="Notes" 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            className="w-full p-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          ></textarea>
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded disabled:bg-indigo-400 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}