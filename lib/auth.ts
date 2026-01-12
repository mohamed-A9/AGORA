// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * NOTE:
 * - Works with App Router route: app/api/auth/[...nextauth]/route.ts
 * - Uses Credentials (email/password)
 * - Enforces email verification (emailVerified must be true)
 * - Injects role into JWT + session (USER / BUSINESS / ADMIN)
 */

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login", // we’ll read ?error=... on the login page if you want
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@domain.com" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            emailVerified: true,
          },
        });

        if (!user) return null;

        // Password check
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // Email verification enforcement
        if (!user.emailVerified) {
          // This becomes `?error=EMAIL_NOT_VERIFIED` on the error page (login)
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Return object becomes `user` in callbacks (jwt)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // USER | BUSINESS | ADMIN
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On login, persist custom fields into JWT
      if (user) {
        token.role = (user as any).role;
        token.uid = (user as any).id;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose custom fields to the client session
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
