"use client";

import { useActionState } from "react";

import { createTenantAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/forms";

const initialState: ActionState = {};

export function CreateTenantForm() {
  const [state, formAction, pending] = useActionState(
    createTenantAction,
    initialState,
  );

  return (
    <form action={formAction} className="panel rounded-[1.6rem] p-6 space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Buat tenant
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-foreground">
          Tenant baru dan admin pertama
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" placeholder="Nama tenant / desa" required />
        <Input name="slug" placeholder="Slug opsional, contoh: desa-makmur" />
        <Input name="contactPhone" placeholder="Kontak tenant" />
        <Input name="contactEmail" type="email" placeholder="Email tenant" />
        <Input name="adminName" placeholder="Nama admin BUMDes" required />
        <Input name="adminEmail" type="email" placeholder="Email admin" required />
        <Input name="adminPhone" placeholder="No. HP admin" />
      </div>

      <Textarea name="description" placeholder="Deskripsi tenant" />

      {state.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{state.success}</p>
          {state.generatedPassword ? (
            <p className="mt-1 font-mono">
              Password sementara admin: {state.generatedPassword}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Membuat tenant..." : "Buat tenant"}
      </Button>
    </form>
  );
}
