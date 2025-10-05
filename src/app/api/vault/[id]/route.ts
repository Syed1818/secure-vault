import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';

// Correct type for params for Next.js App Router
type ParamsType = { params: { id: string } };

// GET a single vault item
export async function GET(req: NextRequest, { params }: ParamsType) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const vaultItem = await VaultItem.findOne({
    _id: params.id,
    userEmail: session.user.email,
  });

  if (!vaultItem) {
    return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
  }

  return NextResponse.json(vaultItem);
}

// DELETE a vault item
export async function DELETE(req: NextRequest, { params }: ParamsType) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const deletedItem = await VaultItem.findOneAndDelete({
    _id: params.id,
    userEmail: session.user.email,
  });

  if (!deletedItem) {
    return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Vault item deleted successfully' });
}

// PUT (update) a vault item
export async function PUT(req: NextRequest, { params }: ParamsType) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, iv, encryptedData } = await req.json();

  if (!title && !iv && !encryptedData) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  await dbConnect();
  const updatedItem = await VaultItem.findOneAndUpdate(
    { _id: params.id, userEmail: session.user.email },
    { $set: { title, iv, encryptedData } },
    { new: true }
  );

  if (!updatedItem) {
    return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
  }

  return NextResponse.json(updatedItem);
}
