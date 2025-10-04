// src/app/api/vault/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const vaultItem = await VaultItem.findOne({ _id: params.id, userId: user._id });

  if (!vaultItem) {
    return NextResponse.json({ message: 'Item not found or you do not have permission' }, { status: 404 });
  }

  await VaultItem.deleteOne({ _id: params.id });

  return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
}