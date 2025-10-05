import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find the vault item by ID and user email
    const vaultItem = await VaultItem.findOne({
      _id: params.id,
      userEmail: session.user.email,
    });

    if (!vaultItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    return NextResponse.json(vaultItem);
  } catch (error) {
    console.error('Vault GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
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
  } catch (error) {
    console.error('Vault DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
