'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from './CurrencyInput'
import { toast } from 'sonner'
import { Loader2, Package, Undo2, Check, ArrowRight } from 'lucide-react'
import { updateServicePricing, type ServicePricingSummary } from '@/app/actions/pricingActions'

interface ServicePricingCardProps {
    service: ServicePricingSummary
    onUpdate: () => void
}

export function ServicePricingCard({ service, onUpdate }: ServicePricingCardProps) {
    const [newPrice, setNewPrice] = useState(service.price)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Sync local state when prop updates (e.g. after successful save and reload)
    useEffect(() => {
        setNewPrice(service.price)
        setHasChanges(false) // Reset changes logic just in case
    }, [service.price])

    const handlePriceChange = (value: number) => {
        setNewPrice(value)
        setHasChanges(value !== service.price)
    }

    const handleSave = async () => {
        if (!hasChanges || newPrice <= 0) return

        setIsSubmitting(true)

        try {
            const result = await updateServicePricing(service.id, newPrice)

            if (result.success) {
                toast.success('Price updated successfully')
                setHasChanges(false)
                onUpdate()
            } else {
                toast.error('Update failed')
            }
        } catch (error) {
            toast.error('Update failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="group relative">
            {/* Hover Indicator */}
            <div className="absolute left-0 top-6 bottom-6 w-1 bg-indigo-500 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

            <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ring-slate-100 group-hover:translate-x-2 rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex items-center gap-5">
                    {/* Icon Box */}
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                        <Package className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h4 className="font-ex-bold text-slate-900 text-base leading-tight truncate">
                                {service.title}
                            </h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                {service.slug}
                                {hasChanges && (
                                    <span className="text-amber-500 flex items-center gap-1 animate-pulse">
                                        • Unsaved Changes
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group/input">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-bold group-focus-within/input:text-indigo-400 transition-colors">$</span>
                                <CurrencyInput
                                    value={newPrice}
                                    onChange={handlePriceChange}
                                    disabled={isSubmitting}
                                    className="h-10 w-28 text-right pr-3 pl-6 font-black bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl text-slate-900"
                                />
                            </div>

                            {/* Action Buttons - reveal on change */}
                            <div className={`flex items-center gap-1.5 transition-all duration-300 ${hasChanges ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 translate-x-4 w-0 overflow-hidden'}`}>
                                <Button
                                    size="icon"
                                    className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-black text-white shadow-lg shadow-indigo-500/20"
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                    onClick={() => {
                                        setNewPrice(service.price)
                                        setHasChanges(false)
                                    }}
                                >
                                    <Undo2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Chevron for non-edit state */}
                            <div className={`transition-all duration-300 ${!hasChanges ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                                <div className="h-8 w-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-400">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
