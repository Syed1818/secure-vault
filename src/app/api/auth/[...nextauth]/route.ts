import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Connect to the database
        await dbConnect();

        // Find the user by email
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          return null;
        }

        // NOTE: If storing hashed passwords, compare hashes here
        if (user.password !== credentials.password) {
          return null;
        }

        // Return user object for session
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/login', // optional: custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export the handler for GET and POST HTTP methods
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
