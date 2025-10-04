// src/components/AddItemForm.tsx

'use client';

import { useState, useEffect } from 'react';

// Define the shape of the data the form handles
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
  initialData?: VaultItemData | null; // Optional prop for pre-filling the form
}

export default function AddItemForm({ onSave, onCancel, initialData }: AddItemFormProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form values whenever initialData changes
  useEffect(() => {
    setTitle(initialData?.title || '');
    setUsername(initialData?.username || '');
    setPassword(initialData?.password || '');
    setUrl(initialData?.url || '');
    setNotes(initialData?.notes || '');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    setIsSubmitting(true);
    await onSave({ title, username, password, url, notes });
    setIsSubmitting(false);
  };

  const isEditing = !!initialData; // Check if we are in "edit" mode

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
          {isEditing ? 'Edit Vault Item' : 'Add New Vault Item'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Google Account"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username / Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2 mt-1 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-sm text-gray-500 dark:text-gray-300"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2 mt-1 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            ></textarea>
          </div>

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
