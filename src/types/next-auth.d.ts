import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      tenantId?: string | null;
      sellerId?: string | null;
      mustChangePassword?: boolean;
    };
  }

  interface User {
    role: UserRole;
    tenantId?: string | null;
    sellerId?: string | null;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    tenantId?: string | null;
    sellerId?: string | null;
    mustChangePassword?: boolean;
  }
}
