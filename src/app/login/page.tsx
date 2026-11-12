import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="shell flex min-h-screen items-center justify-center py-10">
      <div className="panel w-full max-w-md rounded-[2rem] p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Auth.js Credentials
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Masuk ke PasarDesa</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Gunakan akun `SUPER_ADMIN`, `BUMDES_ADMIN`, atau `SELLER` untuk masuk
          ke dashboard yang sesuai.
        </p>

        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
