import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { IUser } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            return null;
          }

          await dbConnect();

          // Use type assertion to tell TypeScript about the user type
          const user = await User.findOne({ email: credentials.email }).lean() as IUser | null;
          
          if (!user) {
            return null;
          }

          // For password comparison, we need the document methods, so fetch again without lean
          const userDoc = await User.findOne({ email: credentials.email });
          if (!userDoc) {
            return null;
          }

          const isValid = await userDoc.comparePassword(credentials.password);
          if (!isValid) {
            return null;
          }

          // Now we can safely access the properties
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };