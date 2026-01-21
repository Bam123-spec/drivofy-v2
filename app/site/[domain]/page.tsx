"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithEmail } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"
import { ArrowRight } from "lucide-react"

export default function SitePage({ params }: { params: { domain: string } }) {
    const domain = params.domain
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await signInWithEmail(email, password)

        if (error) {
            setError(error.message || "Login failed. Please check your credentials.")
            setIsLoading(false)
            return
        }

        // Check user role and redirect
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                console.error("Login successful but failed to fetch user:", userError)
                router.push("/dashboard")
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role || 'student'

            if (role === 'admin') {
                router.push("/admin")
            } else if (role === 'instructor') {
                router.push("/instructor")
            } else {
                await supabase.auth.signOut()
                setError("Access Denied. This portal is for Admins and Instructors only.")
                setIsLoading(false)
            }
        } catch (err) {
            console.error("Unexpected error during redirect:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        {/* Use the logo directly or a placeholder if not available */}
                        <img src="/logo.jpg" alt="Drivofy Logo" className="h-10 w-auto" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                "Logging in..."
                            ) : (
                                <>
                                    Login
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        {"Don't have an account? "}
                        <Link href="/signup" className="text-primary font-medium hover:underline">
                            Sign up for free
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
