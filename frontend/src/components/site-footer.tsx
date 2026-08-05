import Link from "next/link";

const footerLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" },
  { href: "/profile", label: "Profile" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-neutral-600 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>Cachette is a minimal file storage interface for future API integration.</p>
        <div className="flex flex-wrap gap-5">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-black">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}