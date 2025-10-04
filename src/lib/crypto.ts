// src/lib/crypto.ts

// Converts a string to an ArrayBuffer
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer; // THE FIX IS HERE
}

// Converts an ArrayBuffer to a string
function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Converts ArrayBuffer to a hexadecimal string
function ab2hex(buf: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Converts a hexadecimal string to ArrayBuffer
function hex2ab(hex: string): ArrayBuffer {
  const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16)));
  return typedArray.buffer;
}

// Derives a 256-bit AES-GCM key from a password and salt using PBKDF2
export async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const passwordBuffer = str2ab(password);
  const saltBuffer = str2ab(salt);
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypts data with the derived key
export async function encryptData(key: CryptoKey, data: object): Promise<{ iv: string, encryptedData: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random 96-bit IV
  const dataString = JSON.stringify(data);
  const dataBuffer = str2ab(dataString);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );
  
  return {
    iv: ab2hex(iv),
    encryptedData: ab2hex(encryptedBuffer)
  };
}

// Decrypts data with the derived key
export async function decryptData(key: CryptoKey, iv: string, encryptedData: string): Promise<object> {
  const ivBuffer = hex2ab(iv);
  const encryptedBuffer = hex2ab(encryptedData);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );
  
  const decryptedString = ab2str(decryptedBuffer);
  return JSON.parse(decryptedString);
}