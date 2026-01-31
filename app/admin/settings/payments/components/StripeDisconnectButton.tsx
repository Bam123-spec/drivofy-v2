'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { disconnectStripeAccount } from "@/app/actions/stripe"
import { toast } from "sonner"
import { Loader2, PowerOff } from "lucide-react"

export function StripeDisconnectButton({ orgId }: { orgId: string }) {
    const [loading, setLoading] = useState(false)

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect your Stripe account? This will stop your ability to accept payments.")) return

        setLoading(true)
        const result = await disconnectStripeAccount(orgId)
        setLoading(false)

        if (result.success) {
            toast.success("Stripe account disconnected")
        } else {
            toast.error(result.error || "Failed to disconnect account")
        }
    }

    return (
        <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-2"
            onClick={handleDisconnect}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4" />}
            Disconnect Account
        </Button>
    )
}
