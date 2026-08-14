'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import LogoIcon from '@/assets/logo-icon';
import { Progress } from '@/components/ui/progress';
import {
  RiFolder3Line,
  RiShareLine,
  RiDeleteBinLine,
  RiLogoutBoxRLine,
  RiSettings4Line,
} from 'react-icons/ri';

interface SidebarProps {
  activeItem?: string;
}

const STORAGE_QUOTA = 5 * 1024 ** 3; // 5 GB

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function Sidebar({ activeItem = 'files' }: SidebarProps) {
  const { user, logout } = useAuth();

  const storageUsed = user?.storage_used ?? 0;
  const storagePercent = Math.min((storageUsed / STORAGE_QUOTA) * 100, 100);

  const navItems = [
    { id: 'files', label: 'My Files', icon: RiFolder3Line, href: '/dashboard' },
    { id: 'shared', label: 'Shared', icon: RiShareLine, href: '/dashboard' },
    { id: 'trash', label: 'Trash', icon: RiDeleteBinLine, href: '/dashboard' },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon className="size-6 text-white" />
          <span className="text-white text-base font-semibold tracking-tight">Cachette</span>
        </Link>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Storage usage */}
      <div className="px-5 pb-4">
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-[12px] font-medium">Storage</span>
            <span className="text-white/30 text-[11px]">
              {storagePercent.toFixed(0)}%
            </span>
          </div>
          <Progress value={storagePercent} className="h-1 mb-2.5 bg-white/[0.06] [&>div]:bg-white/60" />
          <p className="text-white/30 text-[11px]">
            {formatBytes(storageUsed)} of {formatBytes(STORAGE_QUOTA)}
          </p>
        </div>
      </div>

      {/* User section */}
      <div className="mx-5 h-px bg-white/[0.06]" />
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 px-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-white/60 text-[11px] font-semibold uppercase">
              {user?.email?.charAt(0) || '?'}
            </span>
          </div>
          <span className="text-white/50 text-[12px] truncate">
            {user?.email || 'Loading...'}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/[0.04]"
          title="Log out"
        >
          <RiLogoutBoxRLine className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
