'use client';

import { useState } from 'react';
import { generatePassword } from '@/lib/generatePassword';
import styles from './PasswordGenerator.module.css';

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
    <div className={styles.card}>
      <h2 className={styles.title}>Password Generator</h2>
      
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={generatedPassword}
          readOnly
          placeholder="Click 'Generate' to create a password"
          className={styles.passwordInput}
        />
        <button onClick={handleCopy} className={styles.copyButton}>
          {copyButtonText}
        </button>
      </div>

      <div className={styles.optionsGrid}>
        <div className={styles.sliderContainer}>
          <label htmlFor="length" className={styles.label}>Password Length: {length}</label>
          <input id="length" type="range" min="8" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} />
        </div>
        
        <div className={styles.optionsContainer}>
          <div className={styles.checkboxGroup}>
            <input id="numbers" type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />
            <label htmlFor="numbers" className={styles.label}>Numbers</label>
          </div>
          <div className={styles.checkboxGroup}>
            <input id="symbols" type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />
            <label htmlFor="symbols" className={styles.label}>Symbols</label>
          </div>
          <div className={styles.checkboxGroup}>
            <input id="lookalikes" type="checkbox" checked={excludeLookalikes} onChange={(e) => setExcludeLookalikes(e.target.checked)} />
            <label htmlFor="lookalikes" className={styles.label}>No Look-alikes</label>
          </div>
        </div>
      </div>
      
      <button onClick={handleGenerate} className={styles.generateButton}>
        Generate Password
      </button>
    </div>
  );
}