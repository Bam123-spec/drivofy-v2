import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, CreditCard, ExternalLink, ShieldCheck } from "lucide-react"

export default async function PaymentsSettingsPage({
    searchParams
}: {
    searchParams: { connected?: string, error?: string }
}) {
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

    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle()

    if (!org) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900">Organization Not Found</h3>
                <p className="text-red-700 mt-2">Please contact support if this error persists.</p>
            </div>
        )
    }

    const isConnected = org.square_connected

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                    <CreditCard className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Settings</h1>
                    <p className="text-slate-500 font-medium">Connect and manage your school's merchant accounts.</p>
                </div>
            </div>

            {searchParams.connected && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-900 text-sm">Square account connected successfully!</span>
                </div>
            )}

            {searchParams.error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-900 text-sm">
                        {searchParams.error === 'invalid_state' ? 'Security validation failed. Please try again.' :
                            searchParams.error === 'square_denied' ? 'Connection was canceled or denied.' :
                                'Failed to connect Square account. Please try again.'}
                    </span>
                </div>
            )}

            <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight mb-2">Square Integration</CardTitle>
                            <CardDescription className="text-slate-500 font-medium text-base">
                                Connect your Square account to accept payments for lessons and classes.
                            </CardDescription>
                        </div>
                        {isConnected ? (
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
                    {!isConnected ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                                        Secure Connection
                                    </h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Your payments are processed securely through Square. Drivofy never stores your credit card or login information.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                                        <ExternalLink className="h-5 w-5 text-blue-600" />
                                        Global Acceptance
                                    </h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Accept all major credit cards, Apple Pay, and Google Pay with Square's trusted payment platform.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-sm text-slate-400 font-medium">
                                    Redirects to Square for secure authorization
                                </div>
                                <Button
                                    className="w-full sm:w-auto px-10 h-14 bg-[#111111] hover:bg-[#222222] text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    asChild
                                >
                                    <a href={`/api/square/connect?orgId=${org.id}`}>
                                        Connect Square
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
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Merchant ID</div>
                                    <div className="text-lg font-black text-slate-900 tracking-tight">{org.square_merchant_id || 'Connect to see ID'}</div>
                                    <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Environment: {process.env.SQUARE_ENV || 'sandbox'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-bold text-slate-700">Payments Enabled</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-bold text-slate-700">Daily Sync Active</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-end">
                                <Button variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold rounded-xl h-12 px-6">
                                    Disconnect Square Account
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
