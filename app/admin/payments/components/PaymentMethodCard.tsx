'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, ExternalLink, Plus, ShieldCheck } from "lucide-react"
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
                if (!res.ok) {
                    setPaymentMethod(null)
                    return
                }
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

    const getBrandStyles = (brand: string) => {
        switch (brand.toLowerCase()) {
            case 'visa': return {
                color: 'text-blue-700',
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                gradient: 'from-blue-600 to-blue-800'
            }
            case 'mastercard': return {
                color: 'text-orange-700',
                bg: 'bg-orange-50',
                border: 'border-orange-100',
                gradient: 'from-orange-500 to-red-600'
            }
            case 'amex': return {
                color: 'text-cyan-700',
                bg: 'bg-cyan-50',
                border: 'border-cyan-100',
                gradient: 'from-cyan-500 to-blue-600'
            }
            default: return {
                color: 'text-slate-700',
                bg: 'bg-slate-50',
                border: 'border-slate-100',
                gradient: 'from-slate-600 to-slate-800'
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                    Payment Method
                </h3>
                {paymentMethod && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                        Securely Stored
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-12 flex items-center justify-center shadow-xl shadow-slate-200/40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : paymentMethod ? (
                <div className="group relative">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${getBrandStyles(paymentMethod.brand).gradient} rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-500`} />
                    <div className="relative bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-slate-200/40 hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-6">
                            {/* Premium Card Visual */}
                            <div className={`relative h-14 w-20 rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center bg-gradient-to-br ${getBrandStyles(paymentMethod.brand).gradient} text-white`}>
                                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                                <div className="font-black italic text-[10px] uppercase tracking-tighter z-10">{paymentMethod.brand}</div>
                                <div className="mt-1 flex gap-0.5 z-10">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-1 rounded-full bg-white/40" />)}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-lg font-black text-slate-900 tracking-tight">
                                        {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} •••• {paymentMethod.last4}
                                    </span>
                                    <Badge className="bg-blue-50 text-blue-700 border-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">Default</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                    <span>Expires {paymentMethod.expMonth}/{paymentMethod.expYear}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span>{paymentMethod.name || 'Cardholder'}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleManageBilling}
                            disabled={isPortalLoading}
                            className="rounded-2xl h-12 px-6 border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all font-bold text-sm group/btn"
                        >
                            {isPortalLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            )}
                            Manage Card
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] p-10 text-center group hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                    <div className="h-16 w-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <Plus className="h-8 w-8 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2">No Payment Method</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto">
                        You haven't added a payment method yet. Add one to ensure uninterrupted service.
                    </p>
                    <Button
                        onClick={handleManageBilling}
                        disabled={isPortalLoading}
                        className="rounded-2xl h-12 px-8 bg-slate-900 hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                    >
                        {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add Payment Method
                    </Button>
                </div>
            )}
        </div>
    )
}


