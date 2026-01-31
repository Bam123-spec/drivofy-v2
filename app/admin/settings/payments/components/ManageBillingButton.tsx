'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createCustomerPortalSession } from "@/app/actions/stripe"
import { toast } from "sonner"
import { Loader2, ExternalLink } from "lucide-react"

export function ManageBillingButton({ customerId }: { customerId: string }) {
    const [loading, setLoading] = useState(false)

    const handleManageBilling = async () => {
        setLoading(true)
        const result = await createCustomerPortalSession(customerId)
        setLoading(false)

        if (result.url) {
            window.location.href = result.url
        } else {
            toast.error(result.error || "Failed to open billing portal")
        }
    }

    return (
        <Button
            variant="outline"
            className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-50 gap-2"
            onClick={handleManageBilling}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Manage Billing
        </Button>
    )
}
