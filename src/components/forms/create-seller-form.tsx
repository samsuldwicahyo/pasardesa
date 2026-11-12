"use client";

import { useActionState } from "react";

import { createSellerAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/forms";

const initialState: ActionState = {};

export function CreateSellerForm() {
  const [state, formAction, pending] = useActionState(
    createSellerAction,
    initialState,
  );

  return (
    <form action={formAction} className="panel rounded-[1.6rem] p-6 space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Seller baru
        </p>
        <h3 className="mt-2 text-2xl font-semibold">Buat akun seller</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" placeholder="Nama seller" required />
        <Input name="slug" placeholder="Slug opsional" />
        <Input name="email" type="email" placeholder="Email seller" required />
        <Input name="phone" placeholder="No. HP seller" />
        <Input name="whatsappNumber" placeholder="Nomor WhatsApp seller" />
      </div>

      <Textarea name="description" placeholder="Deskripsi toko" />
      <Textarea name="address" placeholder="Alamat seller" />

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
              Password sementara seller: {state.generatedPassword}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Membuat seller..." : "Buat seller"}
      </Button>
    </form>
  );
}
