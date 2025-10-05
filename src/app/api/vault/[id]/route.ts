import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';

// UPDATE vault item
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const { title, iv, encryptedData } = await request.json();

    const updated = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      { title, iv, encryptedData },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Vault PUT Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE vault item
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    await VaultItem.findOneAndDelete({ _id: params.id, userId: user._id });

    return NextResponse.json({ message: 'Item deleted' }, { status: 200 });
  } catch (error) {
    console.error('Vault DELETE Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
