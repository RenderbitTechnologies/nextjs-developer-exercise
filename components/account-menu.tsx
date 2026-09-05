import { UserMenu } from "@/components/user-menu";
import { getSession } from "@/lib/session";

export default async function AccountMenu() {
  const session = await getSession();
  return <UserMenu user={session?.user ?? null} />;
}
