// src/app/api/vault/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';

// GET all vault items for the logged-in user
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const vaultItems = await VaultItem.find({ userId: user._id });

  return NextResponse.json(vaultItems, { status: 200 });
}


// POST a new vault item for the logged-in user
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const { title, iv, encryptedData } = await request.json();

  if (!title || !iv || !encryptedData) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const newVaultItem = new VaultItem({
    userId: user._id,
    title,
    iv,
    encryptedData,
  });

  await newVaultItem.save();

  return NextResponse.json(newVaultItem, { status: 201 });
}