import { redirect } from "next/navigation";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/lib/db";
import { getDashboardHome } from "@/lib/rbac";
import { loginSchema } from "@/modules/auth/schemas";
import { verifyPassword } from "@/modules/auth/service";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "SUPER_ADMIN" | "BUMDES_ADMIN" | "SELLER";
      tenantId?: string | null;
      sellerId?: string | null;
      mustChangePassword?: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: parsed.data.email.toLowerCase(),
          },
          include: {
            sellerProfile: true,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          sellerId: user.sellerProfile?.id ?? null,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.sellerId = user.sellerId;
        token.mustChangePassword = user.mustChangePassword;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role!;
        session.user.tenantId = token.tenantId;
        session.user.sellerId = token.sellerId;
        session.user.mustChangePassword = token.mustChangePassword;
      }

      return session;
    },
  },
});

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(
  roles: Array<"SUPER_ADMIN" | "BUMDES_ADMIN" | "SELLER">,
) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    redirect(getDashboardHome(session.user.role));
  }

  return session;
}
