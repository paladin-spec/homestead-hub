"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sprout,
  Bird,
  Flame,
  Wrench,
  LayoutDashboard,
  Home,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/plants", icon: Sprout, label: "Plants" },
  { href: "/chickens", icon: Bird, label: "Chickens" },
  { href: "/firewood", icon: Flame, label: "Firewood" },
  { href: "/equipment", icon: Wrench, label: "Equipment" },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-sidebar shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <Home className="h-5 w-5 text-sidebar-primary" />
        <span className="font-semibold text-sidebar-foreground text-sm">Homestead Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Synced to cloud</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}
