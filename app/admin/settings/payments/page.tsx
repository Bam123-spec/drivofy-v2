import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, CreditCard, ExternalLink, ShieldCheck } from "lucide-react"
import { StripeDisconnectButton } from "./components/StripeDisconnectButton"
import { ManageBillingButton } from "./components/ManageBillingButton"

export default async function PaymentsSettingsPage({
    searchParams
}: {
    searchParams: Promise<{ connected?: string, error?: string }>
}) {
    const resolvedSearchParams = await searchParams
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle()

    // Auto-create organization if missing for admin
    if (!org) {
        const { data: newOrg, error: createError } = await supabase
            .from('organizations')
            .insert({
                owner_user_id: user.id,
                current_plan: 'core',
                plan_status: 'active',
                billing_status: 'inactive'
            })
            .select()
            .single()

        if (createError) {
            console.error('Error creating organization:', createError)
            return (
                <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-900">System Error</h3>
                    <p className="text-red-700 mt-2">Could not initialize your organization. Please contact support.</p>
                </div>
            )
        }
        org = newOrg
    }

    // Determine Stripe status
    const stripeConnected = !!org.stripe_account_id
    const stripeStatus = org.stripe_status || 'disconnected'

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#635BFF] rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <CreditCard className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your subscription and school's payout settings.</p>
                </div>
            </div>

            {/* Subscription & Billing Section */}
            <Card className="mb-8 border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-2">Subscription & Billing</CardTitle>
                            <CardDescription className="text-slate-500 font-medium text-base">
                                Manage your Drivofy subscription and billing history.
                            </CardDescription>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700 border-0 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                            {org.current_plan || 'Core'} Plan
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">Current Status</div>
                                <div className="text-sm text-slate-500 capitalize">{org.billing_status || 'inactive'}</div>
                            </div>
                        </div>
                        {org.stripe_customer_id && (
                            <ManageBillingButton customerId={org.stripe_customer_id} />
                        )}
                    </div>
                </CardContent>
            </Card>

            {resolvedSearchParams.connected && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-900 text-sm">Stripe account connected successfully!</span>
                </div>
            )}

            {resolvedSearchParams.error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-900 text-sm">
                        {resolvedSearchParams.error === 'invalid_state' ? 'Security validation failed. Please try again.' :
                            resolvedSearchParams.error === 'config_error' ? 'System configuration error.' :
                                'Failed to connect Stripe account. Please try again.'}
                    </span>
                </div>
            )}

            <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-2">Stripe Integration</CardTitle>
                            <CardDescription className="text-slate-500 font-medium text-base">
                                Connect your Stripe account to accept payments for lessons and classes.
                            </CardDescription>
                        </div>
                        {stripeConnected ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 px-4 py-1.5 rounded-full font-bold flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold px-4 py-1.5 rounded-full">
                                Not Connected
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {!stripeConnected ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-[#635BFF]" />
                                        Secure Payments
                                    </h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        The platform facilitates the connection but never stores your sensitive payment data.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                                        <ExternalLink className="h-5 w-5 text-[#635BFF]" />
                                        Global Reach
                                    </h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Accept major credit cards and digital wallets with Stripe's industry-leading payment platform.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-sm text-slate-400 font-medium">
                                    Accept credit cards and digital wallets
                                </div>
                                <Button
                                    className="w-full sm:w-auto px-10 h-14 bg-[#635BFF] hover:bg-[#5851E9] text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    asChild
                                >
                                    <a href={`/api/stripe/connect?organization_id=${org.id}`}>
                                        Connect Stripe Payouts
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                                <div className="h-16 w-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400">
                                    <CreditCard className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account ID</div>
                                    <div className="text-lg font-black text-slate-900 tracking-tight">{org.stripe_account_id}</div>
                                    <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Status: {stripeStatus}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-[#635BFF]" />
                                    <span className="text-sm font-bold text-slate-700">Payments Enabled</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-[#635BFF]" />
                                    <span className="text-sm font-bold text-slate-700">Payouts Active</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <StripeDisconnectButton orgId={org.id} />
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-50"
                                    asChild
                                >
                                    <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                                        Open Stripe Dashboard
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
