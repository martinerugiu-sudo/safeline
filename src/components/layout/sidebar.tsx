"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck, LayoutDashboard, Package, FileText,
  ClipboardCheck, Bell, BookOpen, Settings, Users, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/equipment", label: "Équipements", icon: Package },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/inspections", label: "Inspections", icon: ClipboardCheck },
  { href: "/alerts", label: "Alertes", icon: Bell },
  { href: "/regulations", label: "Réglementation", icon: BookOpen },
  { href: "/team", label: "Équipe", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <ShieldCheck className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-bold text-white">SafeLine</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
