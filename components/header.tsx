"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, UserIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { getUser, logout, mapSupabaseUser, type User } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isMarketingRoute =
    pathname === "/" ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/terms-of-service") ||
    pathname.startsWith("/services")
  const brandLogo = isMarketingRoute ? "/drivofy-logo.png" : "/logo.jpg"
  const brandAlt = isMarketingRoute ? "Drivofy" : "Selam Driving School"
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ]
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      const currentUser = await getUser()
      if (!active) return
      setUser(currentUser)
    }

    loadUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(mapSupabaseUser(session?.user ?? null))
    })

    return () => {
      active = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    router.push("/")
  }

  return (
    <header className={isMarketingRoute ? "fixed top-0 z-50 w-full" : "fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20"}>
      {isMarketingRoute ? (
        <div className="mx-auto max-w-7xl px-4 pt-3">
          <div className="rounded-[1.75rem] border border-white/8 bg-black/70 backdrop-blur-2xl shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)]">
            <div className="flex h-20 items-center justify-between px-3 md:px-5">
              <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[0.98]">
                <div className="relative h-24 w-[360px] flex items-center">
                  <Image
                    src={brandLogo}
                    alt={brandAlt}
                    width={320}
                    height={120}
                    className="h-24 w-auto object-contain"
                    priority
                  />
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/8 bg-white/4 px-2 py-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-white text-black shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/80">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.name}</span>
                    </div>
                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                    <Button asChild className="rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_24px_-8px_rgba(255,255,255,0.45)]">
                      <Link href="/admin">Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_24px_-8px_rgba(255,255,255,0.45)]">
                      <Link href="/signup">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Free Trial
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              <button
                className="lg:hidden inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-white/8 px-4 pb-4">
                <div className="mt-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(item.href) ? "bg-white text-black" : "text-white/75 hover:bg-white/6 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {user ? (
                    <>
                      <Button className="w-full rounded-2xl bg-white text-black hover:bg-white/90" asChild>
                        <Link href="/admin">Dashboard</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full rounded-2xl text-white/75 hover:text-white hover:bg-white/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full rounded-2xl text-white/75 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button className="w-full rounded-2xl bg-white text-black hover:bg-white/90" asChild>
                        <Link href="/signup">Start Free Trial</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="relative h-32 w-auto flex items-center">
                <Image
                  src={brandLogo}
                  alt={brandAlt}
                  width={320}
                  height={120}
                  className="h-32 w-auto -my-6"
                  priority
                />
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-white/80 pr-2 border-r border-white/10">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  <Button asChild className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                    <Link href="/admin">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4"
                  >
                    Login
                  </Link>
                  <Button asChild className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] rounded-full px-6">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 bg-black/95 border-t border-white/10 absolute left-0 right-0 px-4 shadow-2xl backdrop-blur-xl">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-white/60 px-4">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.name}</span>
                    </div>
                    <Button className="w-full bg-white text-black hover:bg-white/90" asChild>
                      <Link href="/admin">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full bg-white text-black hover:bg-white/90" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
