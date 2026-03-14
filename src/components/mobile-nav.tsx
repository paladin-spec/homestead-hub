"use client"

import { useState } from "react"
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
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/plants", icon: Sprout, label: "Plants" },
  { href: "/chickens", icon: Bird, label: "Chickens" },
  { href: "/firewood", icon: Flame, label: "Firewood" },
  { href: "/equipment", icon: Wrench, label: "Equipment" },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden border-b bg-sidebar px-4 py-3 flex items-center gap-3 shrink-0">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="shrink-0">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      <div className="flex items-center gap-2 flex-1">
        <Home className="h-4 w-4" />
        <span className="font-semibold text-sm">Homestead Manager</span>
      </div>
      <ThemeToggle />

      {/* Dropdown nav */}
      {open && (
        <div className="absolute top-14 left-0 right-0 z-50 bg-sidebar border-b shadow-lg">
          <nav className="px-3 py-2 space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
