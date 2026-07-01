import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page or stock symbol you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className={buttonVariants({ className: "h-10 px-4" })}>
        Back to dashboard
      </Link>
    </div>
  );
}
