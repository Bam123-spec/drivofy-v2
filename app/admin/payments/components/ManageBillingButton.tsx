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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ returnPath: '/admin/payments' }),
            });

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
                ? "bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl h-12 px-8 transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95"
                : "bg-white hover:bg-slate-50 text-slate-900 font-bold border border-slate-200 rounded-2xl h-12 px-8 transition-all shadow-sm active:scale-95"
            }
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <CreditCard className={`mr-2 h-4 w-4 ${mode === 'checkout' ? 'text-blue-400' : 'text-slate-400'}`} />
                    {mode === 'checkout' ? 'Subscribe Now' : 'Manage Billing'}
                </>
            )}
        </Button>
    )
}
