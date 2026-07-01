import Image from "next/image";
import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link
      href="/"
      className="flex w-fit items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      <Image src="/logo.svg" width={32} height={32} alt="" priority />
      <span className="text-xl font-bold tracking-tight">Growex</span>
    </Link>
  );
}
