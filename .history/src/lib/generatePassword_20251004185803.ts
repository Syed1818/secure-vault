// src/lib/generatePassword.ts

interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeLookalikes: boolean;
}

export function generatePassword(options: PasswordOptions): string {
  let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const lookalikes = /[l1IO0o]/g; // Characters to be excluded

  if (options.includeNumbers) {
    charset += numbers;
  }
  if (options.includeSymbols) {
    charset += symbols;
  }
  if (options.excludeLookalikes) {
    charset = charset.replace(lookalikes, '');
  }

  let password = '';
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}