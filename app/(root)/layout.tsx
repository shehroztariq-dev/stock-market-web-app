import Header from "@/components/header";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <Header user={user} />
      <main id="main" className="container flex-1 py-6 md:py-8">
        {children}
      </main>
    </>
  );
};

export default Layout;
