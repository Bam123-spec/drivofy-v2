"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getUser, logout, mapSupabaseUser, type User } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

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
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Image
              src="/drivofy-logo.png"
              alt="Drivofy"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: "Home", href: "/" },
              { name: "Features", href: "/features" },
              { name: "Pricing", href: "/pricing" },
              { name: "How It Works", href: "/how-it-works" },
              { name: "Resources", href: "/resources" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-white/70 transition-all hover:text-white hover:bg-white/5 rounded-full"
              >
                {item.name}
              </Link>
            ))}
          </nav>

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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 bg-black/95 border-t border-white/10 absolute left-0 right-0 px-4 shadow-2xl backdrop-blur-xl">
            {[
              { name: "Home", href: "/" },
              { name: "Features", href: "/features" },
              { name: "Pricing", href: "/pricing" },
              { name: "How It Works", href: "/how-it-works" },
              { name: "Resources", href: "/resources" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
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
    </header>
  )
}
