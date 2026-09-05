import { Suspense } from "react";
import AccountMenu from "@/components/account-menu";
import AccountMenuFallback from "@/components/account-menu-fallback";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative z-10 bg-background">
        <Navbar>
          <Suspense fallback={<AccountMenuFallback />}>
            <AccountMenu />
          </Suspense>
        </Navbar>
        {children}
      </div>
      <Footer />
    </>
  );
}
