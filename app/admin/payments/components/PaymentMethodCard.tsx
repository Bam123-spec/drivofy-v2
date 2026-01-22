'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface BillingPaymentMethod {
    brand: string
    last4: string
    expMonth: number
    expYear: number
    name: string
}

export default function PaymentMethodCard() {
    const [paymentMethod, setPaymentMethod] = useState<BillingPaymentMethod | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPortalLoading, setIsPortalLoading] = useState(false)

    useEffect(() => {
        async function fetchPaymentMethod() {
            try {
                const res = await fetch('/api/billing/payment-method')
                const data = await res.json()
                if (data.paymentMethod) {
                    setPaymentMethod(data.paymentMethod)
                }
            } catch (err) {
                console.error('Failed to fetch payment method:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPaymentMethod()
    }, [])

    const handleManageBilling = async () => {
        setIsPortalLoading(true)
        try {
            const response = await fetch('/api/billing/create-portal-session', {
                method: 'POST',
            })
            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                toast.error("Could not open billing portal")
            }
        } catch (error) {
            toast.error("Failed to connect to billing service")
        } finally {
            setIsPortalLoading(false)
        }
    }

    const getBrandColor = (brand: string) => {
        switch (brand.toLowerCase()) {
            case 'visa': return 'text-blue-700 bg-blue-50'
            case 'mastercard': return 'text-orange-700 bg-orange-50'
            case 'amex': return 'text-cyan-700 bg-cyan-50'
            default: return 'text-gray-700 bg-gray-50'
        }
    }

    return (
        <Card className="border-gray-200 shadow-sm overflow-hidden group">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Payment Method
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                ) : paymentMethod ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 hover:border-blue-200 transition-colors gap-4">
                        <div className="flex items-center gap-5">
                            <div className={`h-12 w-16 rounded-xl border border-gray-200 flex flex-col items-center justify-center shadow-sm ${getBrandColor(paymentMethod.brand)}`}>
                                <div className="font-black italic text-xs uppercase tracking-tighter">{paymentMethod.brand}</div>
                                <div className="h-1 w-8 bg-current opacity-20 rounded-full mt-1" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                                    {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} ending in {paymentMethod.last4}
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] h-5 px-2 font-medium">Default</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-0.5 font-medium">
                                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear} • {paymentMethod.name || 'Cardholder'}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManageBilling}
                            disabled={isPortalLoading}
                            className="rounded-full px-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all group/btn"
                        >
                            {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-3.5 w-3.5 mr-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
                            Update Card
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                        <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No payment method on file</p>
                        <Button variant="link" size="sm" onClick={handleManageBilling} className="text-blue-600 mt-1">
                            Add a payment method
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

