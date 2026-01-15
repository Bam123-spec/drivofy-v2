'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CreditCard } from 'lucide-react'

export default function ManageBillingButton() {
    const [loading, setLoading] = useState(false)

    const handleManageBilling = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/billing/create-portal-session', {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create billing session')
            }

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No portal URL returned')
            }
        } catch (error: any) {
            console.error('Billing portal error:', error)
            toast.error(error.message || 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleManageBilling}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                </>
            ) : (
                <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                </>
            )}
        </Button>
    )
}
