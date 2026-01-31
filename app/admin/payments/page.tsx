import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Download, CheckCircle2, AlertCircle, Calendar, ShieldCheck, Zap, CreditCard as CardIcon } from "lucide-react"
import ManageBillingButton from "./components/ManageBillingButton"
import PaymentMethodCard from "./components/PaymentMethodCard"
import SyncBillingButton from '@/app/billing/SyncBillingButton';

// Mock Data for History (since we don't fetch invoices yet)
interface BillingInvoice {
    id: string
    date: string
    description: string
    amount: number
    currency: 'USD'
    status: 'paid' | 'failed' | 'refunded'
}

const INVOICE_HISTORY: BillingInvoice[] = []

export default async function BillingPage() {
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

    if (!user) {
        redirect('/login')
    }

    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle()

    const isActive = org?.billing_status === 'active' || org?.billing_status === 'trialing'
    const isCanceled = org?.billing_status === 'canceled'

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 sm:px-6">
            {/* Premium Header Section */}
            <div className="relative py-12 mb-12 overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-2xl shadow-blue-900/20">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />

                <div className="relative z-10 px-8 sm:px-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Billing & Security
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                            Subscription Center
                        </h1>
                        <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-lg leading-relaxed">
                            Manage your premium access, billing cycles, and secure payment methods in one place.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <SyncBillingButton />
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl">
                            <div className={`h-3 w-3 rounded-full animate-pulse ${isActive ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : 'bg-slate-500'}`} />
                            <span className="text-sm font-bold uppercase tracking-wider pr-2">
                                {isActive ? 'Active Plan' : 'Account Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Core Plan */}
                <Card className={`relative group overflow-hidden border-2 transition-all ${org?.current_plan === 'core' || !org?.current_plan ? 'border-blue-600 shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            {(org?.current_plan === 'core' || !org?.current_plan) && (
                                <Badge className="bg-blue-600 text-white border-0">Current Plan</Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900">Core</CardTitle>
                        <CardDescription className="text-slate-500 font-medium h-12">Essential features to get your driving school started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900">$34</span>
                            <span className="text-slate-400 font-bold ml-1">/mo</span>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-slate-600">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Student Management
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Basic Scheduling
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <AlertCircle className="h-4 w-4" />
                                Premium Support
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button disabled className="w-full bg-slate-100 text-slate-400 cursor-not-allowed">
                            Default Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Standard Plan */}
                <Card className={`relative group overflow-hidden border-2 transition-all ${org?.current_plan === 'standard' ? 'border-blue-600 shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Zap className="h-6 w-6" />
                            </div>
                            {org?.current_plan === 'standard' && (
                                <Badge className="bg-blue-600 text-white border-0">Current Plan</Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900">Standard</CardTitle>
                        <CardDescription className="text-slate-500 font-medium h-12">More power for growing schools and teams.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900">$59</span>
                            <span className="text-slate-400 font-bold ml-1">/mo</span>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-slate-600">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Everything in Core
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Multi-Instructor Portals
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Advanced Automations
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <a
                            href={`https://buy.stripe.com/6oEg196mR395dGMeUX?client_reference_id=${org?.id}`}
                            className="w-full"
                        >
                            <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold h-12 rounded-xl transition-all">
                                {org?.current_plan === 'standard' ? 'Active Plan' : 'Buy Now'}
                            </Button>
                        </a>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className={`relative group overflow-hidden border-2 transition-all ${org?.current_plan === 'premium' ? 'border-blue-600 shadow-xl' : 'border-indigo-600/20 shadow-lg shadow-indigo-500/5'}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Zap className="h-6 w-6 fill-current" />
                            </div>
                            {org?.current_plan === 'premium' && (
                                <Badge className="bg-blue-600 text-white border-0">Current Plan</Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900">Premium</CardTitle>
                        <CardDescription className="text-slate-500 font-medium h-12">Full white-label experience and priority support.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900">$89</span>
                            <span className="text-slate-400 font-bold ml-1">/mo</span>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-slate-600">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Everything in Standard
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Built-In Website Editor
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                White-Label Domain
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {org?.current_plan === 'premium' ? (
                            <ManageBillingButton
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl transition-all"
                            />
                        ) : (
                            <a
                                href={`https://buy.stripe.com/aFa9AS5iNczF2Tve8d2go02?client_reference_id=${org?.id}`}
                                className="w-full"
                            >
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl transition-all">
                                    Upgrade to Premium
                                </Button>
                            </a>
                        )}
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Payment Method Section */}
                <div className="lg:col-span-8 space-y-10">
                    <PaymentMethodCard />

                    {/* Invoice History */}
                    {isActive && INVOICE_HISTORY.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 px-2">
                                <Download className="h-5 w-5 text-slate-400" />
                                Billing History
                            </h3>
                            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                            <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px] py-6 px-8">Date</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px] py-6">Amount</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px] py-6">Status</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px] py-6 text-right px-8">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {INVOICE_HISTORY.map((invoice) => (
                                            <TableRow key={invoice.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors">
                                                <TableCell className="py-6 px-8 font-bold text-slate-900">
                                                    {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="py-6 font-bold text-slate-900">${invoice.amount}.00</TableCell>
                                                <TableCell className="py-6">
                                                    <Badge className={`
                                                        capitalize font-bold border-0 px-3 py-1 rounded-full text-[10px] tracking-wider
                                                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            invoice.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                                'bg-slate-100 text-slate-700'}
                                                    `}>
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-right">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                        <Download className="h-5 w-5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar / Summary Area */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-8 bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-200 mb-8">Summary</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="text-sm font-bold text-blue-100">Current Plan</div>
                                    <div className="text-4xl font-black tracking-tight capitalize">{org?.current_plan || 'Core'}</div>
                                </div>
                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <div className="flex justify-between text-sm font-medium text-blue-100">
                                        <span>Status</span>
                                        <Badge className="bg-white/20 text-white border-0 capitalize">{org?.plan_status || 'active'}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-blue-100">
                                        <span>Billing Cycle</span>
                                        <span className="text-white">Monthly</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

