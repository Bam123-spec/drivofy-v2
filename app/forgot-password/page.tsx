"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            })

            if (error) {
                throw error
            }

            setIsSubmitted(true)
            toast.success("Reset link sent to your email")
        } catch (error: any) {
            console.error("Error sending reset email:", error)
            toast.error(error.message || "Failed to send reset email")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Header />
            <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                        <CardDescription className="text-center">
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-6">
                                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="font-semibold text-lg">Check your email</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                        We've sent a password reset link to <strong>{email}</strong>.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full mt-4" onClick={() => setIsSubmitted(false)}>
                                    Try another email
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Sending Link..." : "Send Reset Link"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </>
    )
}
