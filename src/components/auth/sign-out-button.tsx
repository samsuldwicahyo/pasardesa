import { logoutAction } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" className="w-full">
        Keluar
      </Button>
    </form>
  );
}
