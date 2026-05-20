import Header from "./_components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col">
      <Header />
      <div>{children}</div>
    </main>
  );
}
