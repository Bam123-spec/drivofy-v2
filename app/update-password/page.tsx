"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"
import { Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let mounted = true
        let timeoutId: NodeJS.Timeout
        let authSubscription: { unsubscribe: () => void } | null = null

        const initSession = async () => {
            try {
                // 1. Set up listener FIRST to catch any events including those during initial load
                const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                    if (!mounted) return

                    if (session) {
                        setIsCheckingSession(false)
                        if (timeoutId) clearTimeout(timeoutId)
                    } else if (_event === 'PASSWORD_RECOVERY') {
                        setIsCheckingSession(false)
                        if (timeoutId) clearTimeout(timeoutId)
                    }
                })
                authSubscription = data.subscription

                // 2. Check current session
                const { data: { session } } = await supabase.auth.getSession()

                if (session && mounted) {
                    setIsCheckingSession(false)
                    if (timeoutId) clearTimeout(timeoutId)
                }


                // 3. Set a safety timeout - if no session after 6s, show error but don't redirect
                // This allows invite links time to process
                timeoutId = setTimeout(() => {
                    if (mounted && isCheckingSession) {
                        setIsCheckingSession(false)
                        // Don't redirect - just let them see the form
                        // If they're here, they likely have a valid token
                    }
                }, 6000)

            } catch (error) {
                console.error('Session init error:', error)
                if (mounted) {
                    setIsCheckingSession(false)
                    // Don't redirect - user might have valid recovery link
                }
            }
        }

        initSession()

        // Cleanup
        return () => {
            mounted = false
            if (timeoutId) clearTimeout(timeoutId)
            if (authSubscription) authSubscription.unsubscribe()
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)

        try {
            console.log('[UPDATE_PASSWORD] Updating password...')


            const { data, error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('[UPDATE_PASSWORD] Error:', error)
                throw error
            }

            console.log('[UPDATE_PASSWORD] Password updated successfully')
            toast.success("Password updated successfully! Redirecting to login...")

            // Sign out after password update to force fresh login
            await supabase.auth.signOut()

            setTimeout(() => {
                router.push("/login")
            }, 1500)
        } catch (error: any) {
            console.error("Error updating password:", error)
            toast.error(error.message || "Failed to update password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <Header />
            <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                        <CardDescription className="text-center">
                            Enter your new password below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </>
    )
}
