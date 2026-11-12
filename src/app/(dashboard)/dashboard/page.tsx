import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { getDashboardHome } from "@/lib/rbac";

export default async function DashboardEntryPage() {
  const session = await requireAuth();
  redirect(getDashboardHome(session.user.role));
}
