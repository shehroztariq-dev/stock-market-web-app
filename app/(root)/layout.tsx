import { auth } from "@/lib/auth/auth";
import Header from "./_components/header";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth?.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) redirect("/sign-in");
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
  return (
    <main className="flex flex-col">
      <Header user={user} />
      <div>{children}</div>
    </main>
  );
};

export default Layout;
