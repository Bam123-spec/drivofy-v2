"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, GripVertical, CheckCircle2, Zap, Clock, Star, Shield, Car, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OfferingFeatures } from "@/app/actions/website"

interface FeatureEditorProps {
    features: OfferingFeatures[]
    onChange: (features: OfferingFeatures[]) => void
}

const ICONS = [
    { value: "CheckCircle2", label: "Checkmark", icon: CheckCircle2 },
    { value: "Clock", label: "Clock", icon: Clock },
    { value: "Zap", label: "Zap", icon: Zap },
    { value: "Star", label: "Star", icon: Star },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "Car", label: "Car", icon: Car },
    { value: "Calendar", label: "Calendar", icon: Calendar },
]

const COLORS = [
    { value: "text-slate-600", label: "Gray (Default)", bg: "bg-slate-50" },
    { value: "text-blue-500", label: "Blue", bg: "bg-blue-50" },
    { value: "text-green-500", label: "Green", bg: "bg-green-50" },
    { value: "text-amber-500", label: "Amber", bg: "bg-amber-50" },
    { value: "text-indigo-500", label: "Indigo", bg: "bg-indigo-50" },
    { value: "text-red-500", label: "Red", bg: "bg-red-50" },
]

export function FeatureEditor({ features = [], onChange }: FeatureEditorProps) {
    const addFeature = () => {
        onChange([...features, { text: "", icon: "CheckCircle2", color: "text-slate-600" }])
    }

    const removeFeature = (index: number) => {
        onChange(features.filter((_, i) => i !== index))
    }

    const updateFeature = (index: number, field: keyof OfferingFeatures, value: string) => {
        const newFeatures = [...features]
        newFeatures[index] = { ...newFeatures[index], [field]: value }
        onChange(newFeatures)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Features List</Label>
                <Button variant="outline" size="sm" onClick={addFeature} type="button">
                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
            </div>

            <div className="space-y-3">
                {features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-start group animate-in slide-in-from-left-2 duration-300">
                        <div className="mt-3 text-slate-400 cursor-move">
                            <GripVertical className="h-4 w-4" />
                        </div>

                        <div className="grid grid-cols-12 gap-2 flex-1">
                            {/* Icon Select */}
                            <div className="col-span-3">
                                <Select
                                    value={feature.icon || "CheckCircle2"}
                                    onValueChange={(val) => updateFeature(index, "icon", val)}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ICONS.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                <div className="flex items-center gap-2">
                                                    <icon.icon className="h-3.5 w-3.5" />
                                                    <span className="text-xs">{icon.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Color Select */}
                            <div className="col-span-3">
                                <Select
                                    value={feature.color || "text-slate-600"}
                                    onValueChange={(val) => updateFeature(index, "color", val)}
                                >
                                    <SelectTrigger className="h-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full ${COLORS.find(c => c.value === (feature.color || "text-slate-600"))?.bg.replace('50', '500')}`} />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLORS.map((color) => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-3 w-3 rounded-full ${color.bg.replace('50', '500')}`} />
                                                    <span className="text-xs">{color.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Text Input */}
                            <div className="col-span-6">
                                <Input
                                    value={feature.text}
                                    onChange={(e) => updateFeature(index, "text", e.target.value)}
                                    placeholder="e.g. 5 Hour Pre-licensing Course"
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                            className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {features.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                        No features added yet. Click "Add Feature" to start.
                    </div>
                )}
            </div>
        </div>
    )
}
