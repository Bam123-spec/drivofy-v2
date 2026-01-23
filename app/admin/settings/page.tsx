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
import {
    Building2,
    Palette,
    CreditCard,
    Bell,
    Save,
    Upload,
    Activity,
    ShieldCheck,
    Globe,
    Zap,
    TrendingUp,
    ArrowUpRight,
    Loader2
} from "lucide-react"

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
        <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-1 bg-blue-600 rounded-full" />
                        <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">System</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">General Settings</h1>
                    <p className="text-slate-500 font-medium text-lg max-w-lg">
                        Manage your organization profile, branding, and system-wide preferences.
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                        <Save className="h-5 w-5 mr-2" />
                    )}
                    {saving ? "Saving Changes..." : "Save Settings"}
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "System Status", value: "Optimal", icon: Zap, color: "blue", trend: "All systems go" },
                    { label: "Plan Level", value: "Premium", icon: ShieldCheck, color: "purple", trend: "Professional" },
                    { label: "Integrations", value: "Active", icon: Globe, color: "emerald", trend: "Square Connected" },
                    { label: "Notifications", value: "Enabled", icon: Activity, color: "orange", trend: "Real-time alerts" },
                ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-600 rounded-2xl group-hover:rotate-6 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <TrendingUp className="h-3 w-3" />
                                    Live
                                </div>
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                <p className="text-slate-400 font-black text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                                <span>{stat.trend}</span>
                                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-10">
                    {/* Organization Settings */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">Organization Profile</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium font-medium">Basic information about your driving school.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">School Name</Label>
                                    <Input
                                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                        value={settings.orgName}
                                        onChange={(e) => handleChange("orgName", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">Default Email</Label>
                                    <Input
                                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                        type="email"
                                        value={settings.orgEmail}
                                        onChange={(e) => handleChange("orgEmail", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-slate-900 font-black pl-1">Phone Number</Label>
                                        <Input
                                            className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                            value={settings.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-900 font-black pl-1">Timezone</Label>
                                        <Select value={settings.timezone} onValueChange={(val) => handleChange("timezone", val)}>
                                            <SelectTrigger className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-0 shadow-2xl p-2">
                                                <SelectItem value="America/New_York" className="rounded-xl">Eastern Time (ET)</SelectItem>
                                                <SelectItem value="America/Chicago" className="rounded-xl">Central Time (CT)</SelectItem>
                                                <SelectItem value="America/Denver" className="rounded-xl">Mountain Time (MT)</SelectItem>
                                                <SelectItem value="America/Los_Angeles" className="rounded-xl">Pacific Time (PT)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding Settings */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                                    <Palette className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">Branding</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Customize the look and feel of your portal.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-start gap-8">
                                <div className="h-28 w-28 rounded-[2rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center text-slate-300 shrink-0 group relative cursor-pointer overflow-hidden">
                                    <Building2 className="h-10 w-10 group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-lg font-black text-slate-900">School Logo</h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Upload your school's logo. Recommended size: 512x512px. JPG or PNG.
                                    </p>
                                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-10 font-bold transition-all shadow-lg active:scale-95">
                                        <Upload className="h-4 w-4 mr-2" /> Upload New
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-slate-900 font-black pl-1">Primary Color</Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {['blue', 'indigo', 'emerald', 'rose'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => handleChange("primaryColor", color)}
                                                className={`h-12 rounded-2xl transition-all border-4 ${settings.primaryColor === color ? 'border-white shadow-xl scale-110 ring-2 ring-slate-100' : 'border-transparent opacity-60 hover:opacity-100'} 
                                                    ${color === 'blue' ? 'bg-blue-600' :
                                                        color === 'indigo' ? 'bg-indigo-600' :
                                                            color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-10">
                    {/* Billing Preferences */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">Billing Preferences</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Configure currency and invoice details.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">Currency</Label>
                                    <Select value={settings.currency} onValueChange={(val) => handleChange("currency", val)}>
                                        <SelectTrigger className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-0 shadow-2xl p-2">
                                            <SelectItem value="USD" className="rounded-xl">USD ($)</SelectItem>
                                            <SelectItem value="CAD" className="rounded-xl">CAD ($)</SelectItem>
                                            <SelectItem value="EUR" className="rounded-xl">EUR (€)</SelectItem>
                                            <SelectItem value="GBP" className="rounded-xl">GBP (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-black pl-1">Tax / VAT Rate (%)</Label>
                                    <Input
                                        type="number"
                                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-blue-500 font-medium"
                                        value={settings.taxRate}
                                        onChange={(e) => handleChange("taxRate", parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-900 font-black pl-1">Invoice Footer Text</Label>
                                <Textarea
                                    className="min-h-[120px] border-slate-100 bg-slate-50/50 rounded-2xl focus:ring-blue-500 font-medium p-6 text-base leading-relaxed"
                                    value={settings.invoiceFooter}
                                    onChange={(e) => handleChange("invoiceFooter", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900">Notifications</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Control what emails you receive.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {[
                                { id: 'notifyFailedPayments', label: 'Failed Payments', desc: 'Receive an email when a student payment fails.' },
                                { id: 'notifyNewEnrollments', label: 'New Enrollments', desc: 'Notify instructors when a new student is assigned.' },
                                { id: 'notifyMonthlySummary', label: 'Monthly Summary', desc: 'Comprehensive financial report on the 1st.' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:bg-white hover:shadow-xl transition-all">
                                    <div className="space-y-1">
                                        <Label className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">{item.label}</Label>
                                        <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                    <Switch
                                        checked={(settings as any)[item.id]}
                                        onCheckedChange={(val) => handleChange(item.id as any, val)}
                                        className="data-[state=checked]:bg-blue-600 shadow-xl"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
