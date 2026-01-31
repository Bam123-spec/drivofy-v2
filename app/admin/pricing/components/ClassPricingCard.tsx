'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from './CurrencyInput'
import { toast } from 'sonner'
import { Loader2, ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react'
import { updateClassTypePricing, type ClassType, type ClassPricingSummary } from '@/app/actions/pricingActions'

interface ClassPricingCardProps {
    classData: ClassPricingSummary
    onUpdate: () => void
}

const CLASS_TYPE_CONFIG: Record<ClassType, { label: string; description: string; color: string; bg: string; border: string }> = {
    DE: {
        label: "Driver's Education",
        description: "Standard 30-hour instruction",
        color: 'text-blue-600',
        bg: 'bg-blue-50/50',
        border: 'border-blue-100'
    },
    RSEP: {
        label: 'RSEP Course',
        description: "Road Safety Education Program",
        color: 'text-emerald-600',
        bg: 'bg-emerald-50/50',
        border: 'border-emerald-100'
    },
    DIP: {
        label: 'Driver Improvement',
        description: "Defensive driving certification",
        color: 'text-amber-600',
        bg: 'bg-amber-50/50',
        border: 'border-amber-100'
    }
}

export function ClassPricingCard({ classData, onUpdate }: ClassPricingCardProps) {
    const [newPrice, setNewPrice] = useState(classData.current_price)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Sync local state when prop updates (e.g. after successful save and reload)
    useEffect(() => {
        setNewPrice(classData.current_price)
        setHasChanges(false) // Reset changes logic just in case
    }, [classData.current_price])

    const config = CLASS_TYPE_CONFIG[classData.class_type]

    const handlePriceChange = (value: number) => {
        setNewPrice(value)
        setHasChanges(value !== classData.current_price)
    }

    const handleSave = async () => {
        if (!hasChanges || newPrice <= 0) return

        setIsSubmitting(true)

        try {
            const result = await updateClassTypePricing(classData.class_type, newPrice)

            if (result.success) {
                toast.success(`Pricing Updated`, {
                    description: `Successfully updated ${result.updated_count} upcoming classes.`
                })
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

    const handleReset = () => {
        setNewPrice(classData.current_price)
        setHasChanges(false)
    }

    return (
        <div className="relative group">
            {/* Hover Glow Effect */}
            <div className={`absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-slate-200 to-slate-200 opacity-0 group-hover:opacity-100 blur transition duration-500 ${hasChanges ? 'from-blue-400 to-indigo-500 opacity-50' : ''}`} />

            <Card className="relative h-full border-0 bg-white shadow-xl shadow-slate-200/50 rounded-[1.8rem] overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                <CardContent className="p-0">
                    {/* Header Section */}
                    <div className={`p-6 pb-8 border-b border-slate-100 ${config.bg}`}>
                        <div className="flex justify-between items-start mb-4">
                            <Badge variant="outline" className={`bg-white font-black text-[10px] tracking-widest uppercase py-1 px-2.5 ${config.color} ${config.border} shadow-sm`}>
                                {classData.class_type}
                            </Badge>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 border border-white/50 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur-sm">
                                <Users className="h-3 w-3 text-slate-400" />
                                {classData.upcoming_count} upcoming
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            {config.label}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500/80 uppercase tracking-wide">
                            {config.description}
                        </p>
                    </div>

                    {/* Pricing Section */}
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Price per student</span>
                                    {hasChanges && <span className="text-blue-600 animate-pulse">Modified</span>}
                                </div>
                                <div className="relative group/input">
                                    <div className={`absolute inset-0 bg-slate-50 rounded-2xl transition-all duration-300 ${hasChanges ? 'bg-blue-50 ring-1 ring-blue-200' : 'group-focus-within/input:bg-white group-focus-within/input:ring-2 group-focus-within/input:ring-blue-500/20'}`} />
                                    <CurrencyInput
                                        value={newPrice}
                                        onChange={handlePriceChange}
                                        disabled={isSubmitting}
                                        className="relative bg-transparent h-14 text-2xl font-black text-slate-900 pl-4 text-center w-full rounded-2xl border-none focus-visible:ring-0 placeholder:text-slate-200"
                                    />
                                    {!hasChanges && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none">
                                            <TrendingUp className="h-4 w-4 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons - Animated Reveal */}
                            <div className={`grid gap-2 transition-all duration-500 ease-spring ${hasChanges ? 'grid-rows-[1fr] opacity-100 pt-2' : 'grid-rows-[0fr] opacity-0 pt-0 overflow-hidden'}`}>
                                <div className="min-h-0 flex gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className="flex-1 h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all text-sm"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Update Pricing
                                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        variant="outline"
                                        className="h-11 px-4 rounded-xl font-bold border-2 border-slate-100 hover:bg-slate-50 text-slate-500 text-sm"
                                    >
                                        ×
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
