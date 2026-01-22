'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CreditCard } from 'lucide-react'

export default function ManageBillingButton({ mode = 'portal' }: { mode?: 'checkout' | 'portal' }) {
    const [loading, setLoading] = useState(false)

    const handleAction = async () => {
        setLoading(true)
        try {
            const endpoint = mode === 'checkout'
                ? '/api/stripe/checkout'
                : '/api/billing/create-portal-session'

            const response = await fetch(endpoint, {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process request')
            }

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No redirect URL returned')
            }
        } catch (error: any) {
            console.error('Billing error:', error)
            toast.error(error.message || 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleAction}
            disabled={loading}
            className={mode === 'checkout'
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            }
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                </>
            ) : (
                <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {mode === 'checkout' ? 'Subscribe Now' : 'Manage Billing'}
                </>
            )}
        </Button>
    )
}
