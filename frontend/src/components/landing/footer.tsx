'use client';

import LogoIcon from '@/assets/logo-icon';
import Link from 'next/link';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] px-6 md:px-10 lg:px-16 py-10 md:py-14 overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 left-6 right-6 md:left-10 md:right-10 lg:left-16 lg:right-16 h-px bg-white/[0.06]" />

      {/* Subtle ambient glow */}
      <div className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoIcon className="size-5 text-indigo-300/40" />
          <span className="text-white/50 text-sm font-medium">Cachette</span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {footerLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-white/30 hover:text-white/60 text-[13px] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-white/20 text-[13px]">
          © {new Date().getFullYear()} Cachette
        </p>
      </div>
    </footer>
  );
}
