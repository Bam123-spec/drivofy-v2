"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Calendar,
    CheckCircle2,
    ExternalLink,
    Loader2,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

export function GoogleCalendarConnect({
    instructorId,
    variant = "full"
}: {
    instructorId?: string,
    variant?: "full" | "compact"
}) {
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [email, setEmail] = useState<string | null>(null)
    const searchParams = useSearchParams()

    useEffect(() => {
        checkConnection()

        // Handle URL params for success/error
        if (searchParams.get('success') === 'google_connected') {
            toast.success("Google Calendar connected successfully!")
        }
        if (searchParams.get('error') === 'google_auth_failed') {
            toast.error("Google authentication failed.")
        }
    }, [instructorId])

    const checkConnection = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('user_google_tokens')
                .select('email')
                .eq('profile_id', user.id)
                .single()

            if (data) {
                setConnected(true)
                setEmail(data.email)
            }
        } catch (error) {
            console.error("Error checking google connection:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = () => {
        window.location.href = '/api/google/auth'
    }

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect Google Calendar?")) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('user_google_tokens')
                .delete()
                .eq('profile_id', user.id)

            if (error) throw error
            setConnected(false)
            setEmail(null)
            toast.success("Disconnected successfully")
        } catch (error) {
            toast.error("Failed to disconnect")
        }
    }

    if (loading) {
        if (variant === "compact") return <div className="h-10 w-48 animate-pulse bg-gray-100 rounded-xl" />
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        )
    }

    if (variant === "compact") {
        return connected ? (
            <div className="flex items-center gap-2 bg-green-50/50 border border-green-100 pl-3 pr-1 py-1 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Sync ON</span>
                </div>
                <div className="h-4 w-[1px] bg-green-200 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="h-7 px-2 text-[10px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                    Disconnect
                </Button>
            </div>
        ) : (
            <Button
                variant="outline"
                size="sm"
                onClick={handleConnect}
                className="h-9 px-4 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm rounded-xl text-[11px] font-bold"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3 w-3 mr-2" />
                Connect GCal
            </Button>
        )
    }

    return (
        <Card className="border-blue-100 bg-blue-50/50 shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Google Calendar
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {connected ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-2 rounded-lg text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Connected</span>
                        </div>
                        {email && (
                            <div className="text-xs text-gray-500 truncate">
                                Linked to: <span className="font-medium text-gray-700">{email}</span>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDisconnect}
                            className="w-full bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Sync your lessons with Google Calendar to avoid double bookings.
                        </p>
                        <Button
                            onClick={handleConnect}
                            className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 mr-2" />
                            Connect Calendar
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
