"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types/forms";

const initialState: ActionState = {};

export function ChangePasswordForm({
  mustChangePassword = false,
}: {
  mustChangePassword?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="panel rounded-[1.5rem] p-6 space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Password
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          {mustChangePassword ? "Ganti password sementara" : "Perbarui password"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          {mustChangePassword
            ? "Akun ini masih memakai password sementara. Ganti password sebelum melanjutkan operasional rutin."
            : "Gunakan form ini untuk mengganti password akun dashboard."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input name="currentPassword" type="password" placeholder="Password saat ini" required />
        <Input name="newPassword" type="password" placeholder="Password baru" required />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password baru"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan password"}
      </Button>
    </form>
  );
}
