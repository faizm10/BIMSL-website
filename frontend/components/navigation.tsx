"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Trophy, Users, Target, HelpCircle, Mail } from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/league-leaders", label: "League Leaders", icon: Users },
  { href: "/scores", label: "Scores", icon: Target },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/contact", label: "Contact", icon: Mail },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="text-xl md:text-2xl font-bold text-foreground">BIMSL</div>
            <span className="hidden sm:inline text-sm text-foreground/60 font-normal">Brampton Intra-Masjid Soccer League</span>
          </Link>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

