import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';

// Correct function signature for PUT
export async function PUT(
  request: NextRequest,
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

  const { title, iv, encryptedData } = await request.json();
  
  const updatedItem = await VaultItem.findOneAndUpdate(
    { _id: params.id, userId: user._id },
    { title, iv, encryptedData },
    { new: true }
  );

  if (!updatedItem) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json(updatedItem, { status: 200 });
}

// Correct function signature for DELETE
export async function DELETE(
  request: NextRequest,
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

  const deletedItem = await VaultItem.findOneAndDelete({
    _id: params.id,
    userId: user._id,
  });

  if (!deletedItem) {
    return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Vault item deleted successfully' });
}