'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
    Loader2,
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle,
    ExternalLink
} from "lucide-react"
import { GoogleCalendarConnect } from "@/app/instructor/profile/components/GoogleCalendarConnect"
import { Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useSearchParams } from "next/navigation"

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
    stripeStatus: 'connected' | 'disconnected'
    stripeAccountId: string | null
    orgId: string | null
}

const INITIAL_SETTINGS: GeneralSettingsFormValues = {
    orgName: "",
    orgEmail: "",
    phone: "",
    timezone: "America/New_York",
    currency: "USD",
    taxRate: 0,
    invoiceFooter: "",
    notifyFailedPayments: true,
    notifyNewEnrollments: true,
    notifyMonthlySummary: false,
    primaryColor: "blue",
    stripeStatus: 'disconnected',
    stripeAccountId: null,
    orgId: null
}


function SettingsContent() {
    const [settings, setSettings] = useState<GeneralSettingsFormValues>(INITIAL_SETTINGS)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()

    useEffect(() => {
        fetchSettings()

        // Check for Stripe connection status in URL
        const connected = searchParams.get('connected')
        const error = searchParams.get('error')

        if (connected) {
            toast.success("Stripe account connected successfully!")
            // Remove params from URL
            window.history.replaceState({}, '', '/admin/settings')
        }

        if (error) {
            toast.error(`Stripe connection failed: ${error}`)
            window.history.replaceState({}, '', '/admin/settings')
        }
    }, [searchParams])

    const fetchSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: org, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('owner_user_id', user.id)
                .single()

            if (error) throw error

            if (org) {
                setSettings({
                    orgName: org.org_name || "",
                    orgEmail: org.org_email || user.email || "",
                    phone: org.phone || "",
                    timezone: org.timezone || "America/New_York",
                    currency: org.currency || "USD",
                    taxRate: org.tax_rate || 0,
                    invoiceFooter: org.invoice_footer || "",
                    notifyFailedPayments: org.notify_failed_payments ?? true,
                    notifyNewEnrollments: org.notify_new_enrollments ?? true,
                    notifyMonthlySummary: org.notify_monthly_summary ?? false,
                    primaryColor: org.primary_color || "blue",
                    stripeStatus: org.stripe_status || 'disconnected',
                    stripeAccountId: org.stripe_account_id,
                    orgId: org.id
                })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings.orgId) return
        setSaving(true)

        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    org_name: settings.orgName,
                    org_email: settings.orgEmail,
                    phone: settings.phone,
                    timezone: settings.timezone,
                    currency: settings.currency,
                    tax_rate: settings.taxRate,
                    invoice_footer: settings.invoiceFooter,
                    notify_failed_payments: settings.notifyFailedPayments,
                    notify_new_enrollments: settings.notifyNewEnrollments,
                    notify_monthly_summary: settings.notifyMonthlySummary,
                    primary_color: settings.primaryColor
                })
                .eq('id', settings.orgId)

            if (error) throw error
            toast.success("Settings saved successfully")
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    const handleConnectStripe = () => {
        if (!settings.orgId) {
            toast.error("Organization ID missing")
            return
        }
        // Redirect to our connect endpoint
        window.location.href = `/api/stripe/connect?organization_id=${settings.orgId}`
    }

    const handleChange = (field: keyof GeneralSettingsFormValues, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">General Settings</h1>
                    <p className="text-slate-500 font-medium text-base mt-1">
                        Manage your organization profile, branding, and system-wide preferences.
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "System Status", value: "Optimal", icon: Zap, color: "blue", trend: "All systems go" },
                    { label: "Plan Level", value: "Premium", icon: ShieldCheck, color: "indigo", trend: "Professional" },
                    {
                        label: "Payments", // Updated from Integrations
                        value: settings.stripeStatus === 'connected' ? "Active" : "Inactive",
                        icon: CreditCard,
                        color: settings.stripeStatus === 'connected' ? "emerald" : "slate",
                        trend: settings.stripeStatus === 'connected' ? "Stripe Connected" : "Connect Stripe"
                    },
                    { label: "Notifications", value: "Enabled", icon: Activity, color: "orange", trend: "Real-time alerts" },
                ].map((stat, i) => (
                    <Card key={i} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <TrendingUp className="h-3 w-3" />
                                    Live
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mt-0.5">{stat.label}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                                <span>{stat.trend}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Organization Settings */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-6 bg-slate-50/30 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Organization Profile</CardTitle>
                                    <CardDescription className="text-slate-500 text-sm">Basic information about your driving school.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">School Name</Label>
                                    <Input
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                        value={settings.orgName}
                                        onChange={(e) => handleChange("orgName", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">Default Email</Label>
                                    <Input
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                        type="email"
                                        value={settings.orgEmail}
                                        onChange={(e) => handleChange("orgEmail", e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 font-semibold text-sm">Phone Number</Label>
                                        <Input
                                            className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                            value={settings.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 font-semibold text-sm">Timezone</Label>
                                        <Select value={settings.timezone} onValueChange={(val) => handleChange("timezone", val)}>
                                            <SelectTrigger className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border border-slate-200 shadow-xl">
                                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding Settings */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-6 bg-slate-50/30 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Branding</CardTitle>
                                    <CardDescription className="text-slate-500 text-sm">Customize the look and feel of your portal.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 group relative cursor-pointer overflow-hidden shadow-sm">
                                    <Building2 className="h-8 w-8 group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                                        <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-900">School Logo</h4>
                                    <p className="text-xs text-slate-500 max-w-[200px]">
                                        JPG or PNG. Recommended size: 512x512px.
                                    </p>
                                    <Button variant="outline" className="h-8 text-xs mt-2 rounded-lg font-bold">
                                        Choose File
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-slate-700 font-semibold text-sm">Primary Color Theme</Label>
                                <div className="flex gap-3">
                                    {['blue', 'indigo', 'emerald', 'rose'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleChange("primaryColor", color)}
                                            className={`h-10 w-10 rounded-xl transition-all border-2 ${settings.primaryColor === color ? 'border-slate-900 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'} 
                                                ${color === 'blue' ? 'bg-blue-600' :
                                                    color === 'indigo' ? 'bg-indigo-600' :
                                                        color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Billing Preferences */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-6 bg-slate-50/30 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Billing Preferences</CardTitle>
                                    <CardDescription className="text-slate-500 text-sm">Configure payments and invoices.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* NEW: Stripe Connect Section */}
                            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            Stripe Integration
                                            {settings.stripeStatus === 'connected' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded textxs font-medium bg-emerald-100 text-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Connected
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-slate-500">Enable payments for your students.</p>
                                    </div>

                                    {settings.stripeStatus === 'connected' ? (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-bold"
                                                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                                            >
                                                Dashboard <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="h-9 bg-[#635BFF] hover:bg-[#5851E9] text-white font-bold"
                                            onClick={handleConnectStripe}
                                        >
                                            Connect Stripe
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">Currency</Label>
                                    <Select value={settings.currency} onValueChange={(val) => handleChange("currency", val)}>
                                        <SelectTrigger className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border border-slate-200 shadow-xl">
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="CAD">CAD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-sm">Tax / VAT Rate (%)</Label>
                                    <Input
                                        type="number"
                                        className="h-10 border-slate-200 bg-white rounded-lg focus:ring-blue-500"
                                        value={settings.taxRate}
                                        onChange={(e) => handleChange("taxRate", parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-sm">Invoice Footer Text</Label>
                                <Textarea
                                    className="min-h-[100px] border-slate-200 bg-white rounded-xl focus:ring-blue-500 text-sm p-4"
                                    placeholder="Thank you for choosing our driving school!"
                                    value={settings.invoiceFooter}
                                    onChange={(e) => handleChange("invoiceFooter", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-6 bg-slate-50/30 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Notifications</CardTitle>
                                    <CardDescription className="text-slate-500 text-sm">Control what emails you receive.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { id: 'notifyFailedPayments', label: 'Failed Payments', desc: 'Alert when a student payment fails.' },
                                { id: 'notifyNewEnrollments', label: 'New Enrollments', desc: 'Alert when a new student joins.' },
                                { id: 'notifyMonthlySummary', label: 'Monthly Summary', desc: 'Progress report on the 1st.' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-slate-800">{item.label}</Label>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <Switch
                                        checked={(settings as any)[item.id]}
                                        onCheckedChange={(val) => handleChange(item.id as any, val)}
                                        className="scale-90"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Google Calendar Integration */}
                    <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-6 bg-slate-50/30 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Google Calendar</CardTitle>
                                    <CardDescription className="text-slate-500 text-sm">Sync with your Google Calendar.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Suspense fallback={<div className="h-10 animate-pulse bg-gray-100 rounded-lg" />}>
                                <GoogleCalendarConnect instructorId="" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
            <SettingsContent />
        </Suspense>
    )
}
