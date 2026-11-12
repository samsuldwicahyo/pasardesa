import { updateSellerProfileAction, upsertSellerPaymentOptionAction } from "@/app/(dashboard)/dashboard/actions";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { getSellerDashboardStats } from "@/modules/dashboard/service";
import { getSellerByUserId } from "@/modules/sellers/service";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const session = await requireRole(["SELLER"]);
  const seller = await getSellerByUserId(session.user.id);

  if (!seller) {
    throw new Error("Akun ini belum terhubung ke seller.");
  }

  const stats = await getSellerDashboardStats(seller.id);

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Seller overview
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{seller.name}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          {seller.description ||
            "Lengkapi profil seller dan metode pembayaran agar produk bisa di-checkout buyer."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Produk" value={stats.productCount} />
        <MetricCard label="Order" value={stats.orderCount} />
        <MetricCard label="Omzet" value={stats.omzet} currency />
      </section>

      <form action={updateSellerProfileAction} className="panel rounded-[1.6rem] p-6 space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Profil seller
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Kontak dan profil toko</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input name="phone" placeholder="No. HP" defaultValue={seller.phone || ""} />
          <Input
            name="whatsappNumber"
            placeholder="Nomor WhatsApp"
            defaultValue={seller.whatsappNumber || ""}
          />
        </div>
        <Textarea
          name="description"
          placeholder="Deskripsi seller"
          defaultValue={seller.description || ""}
        />
        <Textarea
          name="address"
          placeholder="Alamat seller"
          defaultValue={seller.address || ""}
        />
        <Button type="submit">Simpan profil seller</Button>
      </form>

      <section className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Metode pembayaran
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Aktifkan metode yang didukung</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {seller.paymentOptions.map((option) => (
            <form key={option.id} action={upsertSellerPaymentOptionAction} className="panel rounded-[1.4rem] p-5 space-y-3">
              <input type="hidden" name="type" value={option.type} />
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{option.type}</p>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={option.isActive}
                    className="size-4 rounded border border-foreground/20"
                  />
                  Aktif
                </label>
              </div>
              <Input
                name="accountName"
                placeholder="Nama akun"
                defaultValue={option.accountName || ""}
              />
              <Input
                name="accountNumber"
                placeholder="Nomor rekening / akun"
                defaultValue={option.accountNumber || ""}
              />
              <Input
                name="bankName"
                placeholder="Nama bank / provider"
                defaultValue={option.bankName || ""}
              />
              <Input
                name="qrisImageUrl"
                placeholder="URL gambar QRIS"
                defaultValue={option.qrisImageUrl || ""}
              />
              <Textarea
                name="instructions"
                placeholder="Instruksi pembayaran"
                defaultValue={option.instructions || ""}
              />
              <Button type="submit">Simpan metode</Button>
            </form>
          ))}
        </div>
      </section>

      <ChangePasswordForm mustChangePassword={session.user.mustChangePassword} />
    </div>
  );
}
