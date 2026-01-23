"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Offering, updateOfferingDetails } from "@/app/actions/website"
import { FeatureEditor } from "./FeatureEditor"
import { Loader2 } from "lucide-react"

interface OfferingSheetProps {
    offering: Offering | null
    isOpen: boolean
    onClose: () => void
    onSaved: () => void
}

export function OfferingSheet({ offering, isOpen, onClose, onSaved }: OfferingSheetProps) {
    const [formData, setFormData] = useState<Partial<Offering>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (offering) {
            setFormData(offering)
        } else {
            setFormData({})
        }
    }, [offering])

    const handleChange = (field: keyof Offering, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!offering?.id) return

        setIsSaving(true)
        try {
            const result = await updateOfferingDetails(offering.id, formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Offering updated successfully")
                onSaved()
                onClose()
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to save changes")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Offering</SheetTitle>
                    <SheetDescription>
                        Update the details for {offering?.title}. Changes are live immediately after saving.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">General Info</h3>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title || ""}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description || ""}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        value={formData.category || ""}
                                        onChange={(e) => handleChange("category", e.target.value)}
                                        placeholder="e.g. Drivers Ed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug (ReadOnly)</Label>
                                    <Input value={formData.slug || ""} disabled className="bg-slate-50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Numeric Price ($)</Label>
                                <Input
                                    type="number"
                                    value={formData.price_numeric || 0}
                                    onChange={(e) => handleChange("price_numeric", Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Display String</Label>
                                <Input
                                    value={formData.price_display || ""}
                                    onChange={(e) => handleChange("price_display", e.target.value)}
                                    placeholder="e.g. Starting at $390"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between border p-3 rounded-lg">
                            <Label className="cursor-pointer" htmlFor="popular-switch">Mark as Popular</Label>
                            <Switch
                                id="popular-switch"
                                checked={formData.popular || false}
                                onCheckedChange={(checked) => handleChange("popular", checked)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Features</h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <FeatureEditor
                                features={formData.features || []}
                                onChange={(features) => handleChange("features", features)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Links & Media</h3>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input
                                    value={formData.image_url || ""}
                                    onChange={(e) => handleChange("image_url", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Enroll Link</Label>
                                    <Input
                                        value={formData.enroll_link || ""}
                                        onChange={(e) => handleChange("enroll_link", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Learn More Link</Label>
                                    <Input
                                        value={formData.learn_more_link || ""}
                                        onChange={(e) => handleChange("learn_more_link", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="pb-6">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
