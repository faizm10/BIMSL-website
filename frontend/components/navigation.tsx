"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Trophy, Users, Target, HelpCircle, Mail, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors w-full",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground/70 hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="BIMSL Logo"
              width={50}
              height={50}
              className="h-10 w-10 md:h-12 md:w-12 object-contain opacity-90"
              priority
            />
            <div className="flex flex-col">
              <div className="text-xl md:text-2xl font-bold text-foreground">BIMSL</div>
              <span className="hidden sm:inline text-xs text-foreground/60 font-normal">Brampton Intra-Masjid Soccer League</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="BIMSL Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain opacity-90"
                  />
                  <div>
                    <SheetTitle className="text-left text-xl font-bold">BIMSL</SheetTitle>
                    <p className="text-sm text-foreground/60 text-left">Brampton Intra-Masjid Soccer League</p>
                  </div>
                </div>
              </SheetHeader>
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

