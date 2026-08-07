import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-black/8 bg-[#f5f5f3]/75 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-black">
          Cachette
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-neutral-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-black sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}