"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PaymentProofUploadForm({ orderCode }: { orderCode: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <form
      className="mt-5 space-y-3 rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setIsUploading(true);

        const formData = new FormData(event.currentTarget);

        try {
          const response = await fetch(
            `/api/public/orders/${orderCode}/payment-proofs`,
            {
              method: "POST",
              body: formData,
            },
          );

          const json = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(json.error || "Upload gagal.");
          }

          setSuccess("Bukti pembayaran berhasil diunggah.");
          router.refresh();
          event.currentTarget.reset();
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Upload gagal.",
          );
        } finally {
          setIsUploading(false);
        }
      }}
    >
      <Input name="file" type="file" accept="image/*" required />
      <Input name="note" placeholder="Catatan bukti bayar (opsional)" />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" disabled={isUploading}>
        {isUploading ? "Mengunggah..." : "Upload bukti bayar"}
      </Button>
    </form>
  );
}
