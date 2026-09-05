import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getSession();
  if (!session?.user) {
    redirect("/signin?next=/admin");
  }

  return (
    <div className="mx-auto min-h-svh w-full max-w-3xl px-4 pb-20 sm:px-0 mt-5">
      {children}
    </div>
  );
}
