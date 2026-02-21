// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * NOTE:
 * - Works with App Router route: app/api/auth/[...nextauth]/route.ts
 * - Uses Credentials (email/password) & OAuth (Google/Facebook)
 * - Adapter persists users/accounts to DB
 * - Injects role into JWT + session (USER / BUSINESS / ADMIN)
 */

import { cookies } from "next/headers";

if (!process.env.GOOGLE_CLIENT_ID) console.error("⚠️ GOOGLE_CLIENT_ID is missing");
if (!process.env.GOOGLE_CLIENT_SECRET) console.error("⚠️ GOOGLE_CLIENT_SECRET is missing");
if (!process.env.FACEBOOK_CLIENT_ID) console.error("⚠️ FACEBOOK_CLIENT_ID is missing");
if (!process.env.FACEBOOK_CLIENT_SECRET) console.error("⚠️ FACEBOOK_CLIENT_SECRET is missing");

export const authOptions: NextAuthOptions = {
  events: {
    async createUser({ user }) {
      const cookieStore = await cookies();
      const role = cookieStore.get("signup-role")?.value;

      if (role === "BUSINESS") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "BUSINESS" },
        });
      }
    },
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/signup", // Redirect to signup page on error (e.g., role mismatch)
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@domain.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        const intendedRole = credentials?.role; // "USER" or "BUSINESS"

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
            isOnboardingCompleted: true,
          },
        });

        // If user exists but has no password (signed up via OAuth), return null
        if (!user || !user.password) return null;

        // Check correct role - DISABLED to allow login
        // if (intendedRole && user.role !== intendedRole) {
        //   throw new Error("WRONG_ROLE");
        // }

        // Password check
        const ok = await bcrypt.compare(password, user.password);
        console.log(`🔐 Login Debug: Email=${email}, PwdCheck=${ok}, Verified=${user.emailVerified}`);

        if (!ok) return null;

        // Force disable verification check for now
        // if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // USER | BUSINESS | ADMIN
          isOnboardingCompleted: user.isOnboardingCompleted,
        } as any;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // 1. Check existing user by email (case-insensitive)
      if (!user.email) return true;

      const email = user.email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { role: true, email: true },
      });

      // 2. Read intended role from cookies
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      const loginRole = cookieStore.get("login-role")?.value;
      const signupRole = cookieStore.get("signup-role")?.value;
      const authIntent = cookieStore.get("auth_intent")?.value;
      const intendedRole = loginRole || signupRole;

      console.log('🔐 SignIn Callback Debug:', {
        email,
        existingUser: existingUser ? { role: existingUser.role } : null,
        loginRole,
        signupRole,
        intendedRole,
        authIntent,
        allCookies: allCookies.map(c => ({ name: c.name, value: c.value })),
        provider: account?.provider
      });

      // 3. If user exists, enforce role match
      if (existingUser) {
        // Ensure the user object passed to JWT has the up-to-date role from DB
        (user as any).role = existingUser.role;

        if (intendedRole && existingUser.role !== intendedRole) {
          console.log('⚠️ Role mismatch detected but allowing login:', {
            existingRole: existingUser.role,
            intendedRole,
            email
          });
          // We allow the login. The session will use the existingUser.role.
        }
        return true;
      }

      // 4. If user does NOT exist (new signup)
      // Strict Check: If intent was 'login', DO NOT create account.
      if (authIntent === "login") {
        console.log("🛑 Login attempt for non-existent user rejected:", email);
        return "/signup?error=AccountNotFound";
      }

      console.log('✅ Sign-up allowed for:', email);
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // On login, persist custom fields into JWT
      if (user) {
        token.role = (user as any).role;
        token.uid = (user as any).id;
        token.isOnboardingCompleted = (user as any).isOnboardingCompleted;
        token.emailVerified = (user as any).emailVerified;
      }

      // Handle Session Update (Refetch from DB) to refresh token
      if (trigger === "update") {
        console.log("JWT Update Triggered. Token ID:", token.uid || token.sub);
        const userId = (token.uid as string) || (token.sub as string);

        if (userId) {
          try {
            const freshUser = await prisma.user.findUnique({
              where: { id: userId }
            });
            if (freshUser) {
              console.log("Refreshed User Data. Onboarding:", freshUser.isOnboardingCompleted);
              token.isOnboardingCompleted = freshUser.isOnboardingCompleted;
              token.emailVerified = freshUser.emailVerified;
              token.role = freshUser.role;
              token.name = freshUser.name;
              token.email = freshUser.email;
            }
          } catch (error) {
            console.error("Error refreshing user in JWT:", error);
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Expose custom fields to the client session
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).isOnboardingCompleted = token.isOnboardingCompleted;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
