Secure Vault
Secure Vault is a simple, fast, and privacy-first password manager built with Next.js, React, and MongoDB. It provides end-to-end encryption for your sensitive data, ensuring that only you can access your information.

Features
End-to-End Encryption: Your data is encrypted and decrypted on the client-side. The server only ever sees encrypted blobs.

User Authentication: Secure user registration and login system.

Password Generator: Create strong, random passwords with customizable options.

CRUD Operations: Add, view, edit, and delete your encrypted vault items.

Search: Quickly find the items you're looking for.

Dark Mode: A comfortable viewing experience in low-light environments.

Tech Stack
Frontend: Next.js (React)

Backend: Next.js API Routes, NextAuth.js

Database: MongoDB

Styling: CSS Modules

Cryptography: Web Crypto API (AES-GCM for encryption, PBKDF2 for key derivation)

Getting Started
Prerequisites
Node.js (v18 or later)

npm or yarn

MongoDB Atlas account (or a local MongoDB instance)

Installation
Clone the repository:

Bash

git clone https://github.com/syed1818/secure-vault.git
cd secure-vault
Install dependencies:

Bash

npm install
Environment Variables
Create a .env.local file in the root of the project and add the following environment variables:

MONGODB_URI=<your_mongodb_connection_string>
NEXTAUTH_SECRET=<your_nextauth_secret>
You can generate a NEXTAUTH_SECRET by running the following command in your terminal:

Bash

openssl rand -base64 32
Running the Development Server
Bash

npm run dev
Open http://localhost:3000 with your browser to see the result.

How It Works
Secure Vault uses a master password that is never sent to the server. This master password, combined with your email (as a salt), is used to derive an encryption key using PBKDF2. This key is then used to encrypt and decrypt your vault items using AES-GCM.

The server only stores the encrypted data, meaning that even if the database is compromised, your sensitive information remains secure.

License
This project is licensed under the MIT License - see the LICENSE file for details.