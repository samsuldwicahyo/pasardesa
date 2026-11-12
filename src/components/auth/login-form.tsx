"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types/forms";

const initialState: ActionState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl || "/dashboard"} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <Input id="password" name="password" type="password" required />
      </div>

      {state.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
