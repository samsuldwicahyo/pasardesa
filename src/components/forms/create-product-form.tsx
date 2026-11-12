"use client";

import { useActionState } from "react";

import { createProductAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/forms";

const initialState: ActionState = {};

export function CreateProductForm() {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState,
  );

  return (
    <form action={formAction} className="panel rounded-[1.6rem] p-6 space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Produk baru
        </p>
        <h3 className="mt-2 text-2xl font-semibold">Tambahkan produk seller</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" placeholder="Nama produk" required />
        <Input name="slug" placeholder="Slug opsional" />
        <Input name="sku" placeholder="SKU" />
        <Input name="price" type="number" min="0" step="1000" placeholder="Harga" required />
        <Input name="stock" type="number" min="0" step="1" placeholder="Stok" required />
        <Select name="status" defaultValue="PUBLISHED">
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </Select>
      </div>

      <Textarea name="description" placeholder="Deskripsi produk" />

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="imageAltText" placeholder="Alt text gambar" />
        <Input name="image" type="file" accept="image/*" />
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
        {pending ? "Menyimpan produk..." : "Simpan produk"}
      </Button>
    </form>
  );
}
