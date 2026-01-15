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

export function GoogleCalendarConnect({ instructorId }: { instructorId: string }) {
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
            const { data, error } = await supabase
                .from('instructor_google_tokens')
                .select('email')
                .eq('instructor_id', instructorId)
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
            const { error } = await supabase
                .from('instructor_google_tokens')
                .delete()
                .eq('instructor_id', instructorId)

            if (error) throw error
            setConnected(false)
            setEmail(null)
            toast.success("Disconnected successfully")
        } catch (error) {
            toast.error("Failed to disconnect")
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-blue-100 bg-blue-50/50">
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
