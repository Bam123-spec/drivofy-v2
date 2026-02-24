'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const isStudentResetRoute = pathname?.startsWith("/student/")
    const expiredLinkRedirect = isStudentResetRoute ? "/student/login" : "/forgot-password"
    const postResetLoginRedirect = isStudentResetRoute ? "/student/login" : "/login"

    useEffect(() => {
        let mounted = true
        let authSubscription: { unsubscribe: () => void } | null = null
        let timeoutId: NodeJS.Timeout | null = null

        const initSession = async () => {
            try {
                console.log('[UPDATE_PASSWORD] Checking for session...')

                // Check if there's a hash fragment with tokens (from invite/recovery links)
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const accessToken = hashParams.get('access_token')
                const refreshToken = hashParams.get('refresh_token')
                const error = hashParams.get('error')
                const errorDescription = hashParams.get('error_description')

                // Check for errors in the URL
                if (error) {
                    console.error('[UPDATE_PASSWORD] Error in URL:', error, errorDescription)
                    toast.error(errorDescription || 'Invalid or expired link')
                    setTimeout(() => router.push(expiredLinkRedirect), 2000)
                    setIsCheckingSession(false)
                    return
                }

                // If we have tokens in the hash, set the session manually
                if (accessToken) {
                    console.log('[UPDATE_PASSWORD] Found tokens in URL, setting session...')
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    })

                    if (error) {
                        console.error('[UPDATE_PASSWORD] Error setting session:', error)
                        toast.error('Failed to verify link. Please try again.')
                        setTimeout(() => router.push(expiredLinkRedirect), 2000)
                        setIsCheckingSession(false)
                        return
                    }

                    if (data.session) {
                        console.log('[UPDATE_PASSWORD] Session established from URL tokens')
                        setIsCheckingSession(false)
                        return
                    }
                }

                // Otherwise, check if we already have a session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    console.error('[UPDATE_PASSWORD] Session error:', sessionError)
                }

                if (session && mounted) {
                    console.log('[UPDATE_PASSWORD] Existing session found:', session.user.id)
                    setIsCheckingSession(false)
                    return
                }

                console.log('[UPDATE_PASSWORD] No session found yet, waiting for auth state change...')

                // Set up listener for auth state changes
                const { data } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log('[UPDATE_PASSWORD] Auth event:', event, session?.user?.id)

                    if (!mounted) return

                    if (session) {
                        console.log('[UPDATE_PASSWORD] Session established via auth state change')
                        setIsCheckingSession(false)
                    }
                })
                authSubscription = data.subscription

                // Extended timeout to allow session to be established from cookie redirect
                // If after 10 seconds there's still no session, allow the form to show
                // The user can still try to submit, and we'll handle the error gracefully
                timeoutId = setTimeout(() => {
                    if (mounted) {
                        console.log('[UPDATE_PASSWORD] Timeout - proceeding without confirmed session')
                        setIsCheckingSession(false)
                    }
                }, 10000)

            } catch (error) {
                console.error('[UPDATE_PASSWORD] Init error:', error)
                if (mounted) {
                    setIsCheckingSession(false)
                }
            }
        }

        initSession()

        return () => {
            mounted = false
            if (authSubscription) authSubscription.unsubscribe()
            if (timeoutId) clearTimeout(timeoutId)
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
            console.log('[UPDATE_PASSWORD] Attempting password update...')

            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('[UPDATE_PASSWORD] Error:', error)

                if (error.message.includes('session_not_found') || error.message.includes('Auth session missing')) {
                    toast.error("Invalid or expired link. Please request a new password reset.")
                    setTimeout(() => router.push(expiredLinkRedirect), 2000)
                    return
                }

                throw error
            }

            console.log('[UPDATE_PASSWORD] Password updated successfully')
            toast.success("Password updated successfully! Redirecting to login...")

            // Sign out to force fresh login with new password
            await supabase.auth.signOut()

            setTimeout(() => {
                router.push(postResetLoginRedirect)
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
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20 bg-gradient-to-b from-background to-muted/20">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-12 pb-12 flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Verifying your link...</p>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="min-h-screen flex items-center justify-center px-4 pt-80 pb-20 bg-gradient-to-b from-background to-muted/20">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                        <CardDescription className="text-center">
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="pl-9"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="pl-9"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="mt-6">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
            <Footer />
        </>
    )
}
