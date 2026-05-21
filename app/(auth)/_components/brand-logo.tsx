import Image from "next/image";

export default function BrandLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Image src="/logo.png" width={36} height={36} alt="logo" priority />
      <p className="text-xl font-bold font-mono">Horizon</p>
    </div>
  );
}
