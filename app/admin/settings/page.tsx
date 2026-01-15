'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Building2, Palette, CreditCard, Bell, Save, Upload } from "lucide-react"

interface GeneralSettingsFormValues {
    orgName: string
    orgEmail: string
    phone: string
    timezone: string
    currency: string
    taxRate: number
    invoiceFooter: string
    notifyFailedPayments: boolean
    notifyNewEnrollments: boolean
    notifyMonthlySummary: boolean
    primaryColor: string
}

const INITIAL_SETTINGS: GeneralSettingsFormValues = {
    orgName: "Drivofy Driving School",
    orgEmail: "admin@drivofy.com",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    currency: "USD",
    taxRate: 8.5,
    invoiceFooter: "Thank you for choosing Drivofy! Please contact support for any billing questions.",
    notifyFailedPayments: true,
    notifyNewEnrollments: true,
    notifyMonthlySummary: false,
    primaryColor: "blue"
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<GeneralSettingsFormValues>(INITIAL_SETTINGS)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log("Saving settings:", settings)
        toast.success("Settings saved successfully")
        setSaving(false)
    }

    const handleChange = (field: keyof GeneralSettingsFormValues, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">General Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your organization profile and system preferences.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    {saving ? "Saving..." : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* Organization Settings */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Organization Profile</CardTitle>
                            <CardDescription>Basic information about your driving school.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">School Name</Label>
                            <Input
                                id="orgName"
                                value={settings.orgName}
                                onChange={(e) => handleChange("orgName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgEmail">Default Email</Label>
                            <Input
                                id="orgEmail"
                                type="email"
                                value={settings.orgEmail}
                                onChange={(e) => handleChange("orgEmail", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={settings.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select value={settings.timezone} onValueChange={(val) => handleChange("timezone", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branding Settings */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Palette className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Branding</CardTitle>
                            <CardDescription>Customize the look and feel of your portal.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-6">
                        <div className="h-24 w-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                            <div className="text-center">
                                <div className="text-xs font-medium">Logo</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">School Logo</h4>
                            <p className="text-xs text-gray-500 max-w-sm">
                                Upload your school's logo. Recommended size: 512x512px. JPG or PNG.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                                <Upload className="h-3 w-3 mr-2" /> Upload Logo
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 max-w-xs">
                        <Label>Primary Color</Label>
                        <Select value={settings.primaryColor} onValueChange={(val) => handleChange("primaryColor", val)}>
                            <SelectTrigger>
                                <div className="flex items-center gap-2">
                                    <div className={`h-4 w-4 rounded-full ${settings.primaryColor === 'blue' ? 'bg-blue-600' :
                                            settings.primaryColor === 'indigo' ? 'bg-indigo-600' :
                                                settings.primaryColor === 'emerald' ? 'bg-emerald-600' :
                                                    settings.primaryColor === 'rose' ? 'bg-rose-600' : 'bg-gray-900'
                                        }`} />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="indigo">Indigo</SelectItem>
                                <SelectItem value="emerald">Emerald</SelectItem>
                                <SelectItem value="rose">Rose</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Billing Preferences */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Billing Preferences</CardTitle>
                            <CardDescription>Configure currency and invoice details.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={settings.currency} onValueChange={(val) => handleChange("currency", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="CAD">CAD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxRate">Tax / VAT Rate (%)</Label>
                            <Input
                                id="taxRate"
                                type="number"
                                value={settings.taxRate}
                                onChange={(e) => handleChange("taxRate", parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                        <Textarea
                            id="invoiceFooter"
                            value={settings.invoiceFooter}
                            onChange={(e) => handleChange("invoiceFooter", e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Notifications</CardTitle>
                            <CardDescription>Control what emails you receive.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Failed Payments</Label>
                            <p className="text-xs text-gray-500">Receive an email when a student payment fails.</p>
                        </div>
                        <Switch
                            checked={settings.notifyFailedPayments}
                            onCheckedChange={(val) => handleChange("notifyFailedPayments", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">New Enrollments</Label>
                            <p className="text-xs text-gray-500">Notify instructors when a new student is assigned.</p>
                        </div>
                        <Switch
                            checked={settings.notifyNewEnrollments}
                            onCheckedChange={(val) => handleChange("notifyNewEnrollments", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Monthly Revenue Summary</Label>
                            <p className="text-xs text-gray-500">Send a financial summary to owners on the 1st of each month.</p>
                        </div>
                        <Switch
                            checked={settings.notifyMonthlySummary}
                            onCheckedChange={(val) => handleChange("notifyMonthlySummary", val)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
