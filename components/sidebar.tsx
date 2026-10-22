"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  Landmark,
  Users,
  ShieldCheck,
  UserCog,
  CircleUserRound,
  CalendarDays,
  IdCard,
  Network,
  BookOpenText,
  Compass,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/login/actions";

type NavLeaf = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

type NavGroup = {
  title: string;
  items: NavLeaf[];
};

const adminNavGroups: NavGroup[] = [
  {
    title: "Data Master",
    items: [
      {
        label: "Sekolah",
        icon: School,
        href: "/dashboard/sekolah",
      },
      {
        label: "Perguruan Tinggi",
        icon: Landmark,
        href: "/dashboard/perguruan-tinggi",
      },
    ],
  },
  {
    title: "Data Alumni",
    items: [
      {
        label: "Data Alumni",
        icon: Users,
        href: "/dashboard/data-alumni",
      },
      {
        label: "Acara Alumni",
        icon: CalendarDays,
        href: "/dashboard/acara",
      },
    ],
  },
  {
    title: "Verifikasi",
    items: [
      {
        label: "Verifikasi Data",
        icon: ShieldCheck,
        href: "/dashboard/verifikasi-data",
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      {
        label: "Daftar Pengguna",
        icon: UserCog,
        href: "/dashboard/pengguna",
      },
      {
        label: "Pengaturan Akun",
        icon: CircleUserRound,
        href: "/dashboard/akun",
      },
    ],
  },
];

const alumniNavGroups: NavGroup[] = [
  {
    title: "Portal Alumni",
    items: [
      { label: "Profil Saya", icon: IdCard, href: "/alumni" },
      { label: "Alumni Network", icon: Network, href: "/alumni/jaringan" },
      { label: "Share Your Journey", icon: BookOpenText, href: "/alumni/cerita" },
      { label: "Career Finder", icon: Compass, href: "/alumni/career-finder" },
    ],
  },
  {
    title: "Pengaturan",
    items: [{ label: "Pengaturan Akun", icon: CircleUserRound, href: "/alumni/akun" }],
  },
];

// Admin punya tautan Dashboard di paling atas; portal alumni langsung ke grup menu.
const sidebarConfig = {
  admin: { home: { label: "Dashboard", href: "/dashboard" }, groups: adminNavGroups },
  alumni: { home: null, groups: alumniNavGroups },
};

export function Sidebar({ variant = "admin" }: { variant?: "admin" | "alumni" }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { home, groups } = sidebarConfig[variant];

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col bg-[#0d1a37] text-slate-300 transition-[width] duration-200 md:sticky md:top-0 md:flex md:h-screen",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          B
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              BINUS UNIVERSITY
            </p>
            <p className="truncate text-xs text-slate-400">
              Alumni Tracking System
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {home && (
          <Link
            href={home.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === home.href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <LayoutDashboard className="size-4 shrink-0" />
            {!collapsed && <span>{home.label}</span>}
          </Link>
        )}

        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isItemActive = pathname === item.href.split("?")[0];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isItemActive
                        ? "bg-blue-600 font-medium text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          title={collapsed ? "Keluar" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-rose-400"
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-slate-400 hover:text-white"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
        {!collapsed && <span>Sembunyikan Menu</span>}
      </button>
    </aside>
  );
}
