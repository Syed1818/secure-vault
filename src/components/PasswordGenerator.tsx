'use client';

import { useState } from 'react';
import { generatePassword } from '@/lib/generatePassword';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookalikes, setExcludeLookalikes] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const handleGenerate = () => {
    const newPassword = generatePassword({
      length, includeNumbers, includeSymbols, excludeLookalikes,
    });
    setGeneratedPassword(newPassword);
    setCopyButtonText('Copy');
  };

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    });
  };

  return (
    <div className="w-full p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Password Generator</h2>
      <div className="relative mt-4">
        <input type="text" value={generatedPassword} readOnly placeholder="Click 'Generate' to create a password" className="w-full p-3 pr-20 text-lg font-mono text-gray-800 bg-gray-100 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
        <button onClick={handleCopy} className="absolute inset-y-0 right-0 px-4 font-semibold text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
          {copyButtonText}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor="length" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Length: {length}</label>
          <input id="length" type="range" min="8" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input id="numbers" type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="numbers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Numbers (123)</label>
          </div>
          <div className="flex items-center">
            <input id="symbols" type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="symbols" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Symbols (!@#)</label>
          </div>
          <div className="flex items-center">
            <input id="lookalikes" type="checkbox" checked={excludeLookalikes} onChange={(e) => setExcludeLookalikes(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="lookalikes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">No Look-alikes (I,l,1,O,0)</label>
          </div>
        </div>
      </div>
      <button onClick={handleGenerate} className="w-full px-6 py-3 mt-8 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
        Generate Password
      </button>
    </div>
  );
}