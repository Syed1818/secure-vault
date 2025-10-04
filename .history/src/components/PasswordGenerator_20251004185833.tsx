// src/components/PasswordGenerator.tsx

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
      length,
      includeNumbers,
      includeSymbols,
      excludeLookalikes,
    });
    setGeneratedPassword(newPassword);
    setCopyButtonText('Copy'); // Reset copy button text
  };

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000); // Reset after 2 seconds
    }
  };

  return (
    <div className="w-full p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-700">Password Generator</h2>
      
      <div className="relative mt-4">
        <input
          type="text"
          value={generatedPassword}
          readOnly
          placeholder="Click 'Generate' to create a password"
          className="w-full p-3 pr-20 text-lg font-mono text-gray-800 bg-gray-100 border rounded-md"
        />
        <button 
            onClick={handleCopy}
            className="absolute inset-y-0 right-0 px-4 font-semibold text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700"
        >
          {copyButtonText}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
        {/* Length Slider */}
        <div className="flex flex-col">
          <label htmlFor="length" className="text-sm font-medium">Password Length: {length}</label>
          <input
            id="length"
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Options */}
        <div className="flex items-center space-x-6">
            <div className="flex items-center">
                <input id="numbers" type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded"/>
                <label htmlFor="numbers" className="ml-2 text-sm">Numbers (123)</label>
            </div>
            <div className="flex items-center">
                <input id="symbols" type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded"/>
                <label htmlFor="symbols" className="ml-2 text-sm">Symbols (!@#)</label>
            </div>
             <div className="flex items-center">
                <input id="lookalikes" type="checkbox" checked={excludeLookalikes} onChange={(e) => setExcludeLookalikes(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded"/>
                <label htmlFor="lookalikes" className="ml-2 text-sm">No Look-alikes (I,l,1,O,0)</label>
            </div>
        </div>
      </div>
      
      <button 
        onClick={handleGenerate}
        className="w-full px-6 py-3 mt-8 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Generate Password
      </button>
    </div>
  );
}