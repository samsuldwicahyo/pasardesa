# PasarDesa

Marketplace BUMDes multi-tenant berbasis Next.js. Satu tenant memiliki admin, penjual, katalog, dan pesanan sendiri. Pembeli dapat checkout sebagai tamu; pesanan dipecah per penjual.

## Fitur yang tersedia di source

- Dashboard superadmin untuk membuat tenant dan akun admin awal.
- Dashboard admin tenant untuk mengelola penjual dan meninjau pesanan.
- Dashboard penjual untuk produk, stok, opsi pembayaran, dan pesanan.
- Katalog `/pasar/[tenantSlug]`, keranjang, checkout, status pesanan, serta unggah bukti transfer/QRIS.
- Auth.js Credentials dengan peran SUPER_ADMIN, BUMDES_ADMIN, dan SELLER.
- Tautan WhatsApp, transfer bank, QRIS, dan COD sebagai alur pembayaran manual. Tidak ada klaim integrasi payment gateway otomatis.

## Stack

Next.js 16, React 19, TypeScript, PostgreSQL, Prisma 6, Auth.js, Tailwind CSS, Cloudinary, dan Vitest. Versi lengkap mengikuti `package.json` dan `pnpm-lock.yaml`.

## Menjalankan lokal

Siapkan Node.js 22 LTS, pnpm 10, dan database PostgreSQL kosong.

```sh
pnpm install --frozen-lockfile
```

Salin `.env.example` menjadi `.env`, lalu isi DATABASE_URL, AUTH_SECRET, SUPER_ADMIN_EMAIL, dan SUPER_ADMIN_PASSWORD. Buat AUTH_SECRET acak, misalnya dengan:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
pnpm prisma:generate
pnpm db:setup
pnpm dev
```

Buka `http://localhost:3000/login`. Bootstrap membuat satu superadmin berdasarkan konfigurasi lokal; tidak menyertakan akun demo, transaksi, nomor rekening, atau data pelanggan. Menjalankan ulang bootstrap tidak mereset password akun yang sudah ada. Buat tenant dan penjual melalui dashboard. Cloudinary bersifat opsional sampai fitur unggah media digunakan; isi ketiga variabel Cloudinary untuk unggahan bertanda tangan.

Script `dev:local` menyediakan alternatif PGlite di `.pglite/` untuk pengembangan; jalur PostgreSQL di atas adalah setup utama yang didokumentasikan.

## Pemeriksaan

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Status hasil pemeriksaan export dicatat pada laporan persiapan terpisah. Source ini adalah aplikasi pengembangan/portfolio; alur pembayaran manual, isolasi tenant, dan layanan media tetap perlu diuji terhadap konfigurasi deployment sendiri.

Dokumentasi tambahan: [arsitektur](docs/architecture.md), [ERD](docs/erd.md), dan [alur pengguna](docs/flows.md). Direktori aplikasi sekarang berada di root repository.
