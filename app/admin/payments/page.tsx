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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-10">

                    {/* The "Out of the Box" Plan Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative bg-white border border-slate-100 rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                            <Zap className="h-6 w-6 fill-current" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Drivofy Standard</h2>
                                    </div>
                                    <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                                        Full access to the admin dashboard, instructor portals, and student management tools.
                                    </p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-4xl font-black text-slate-900 tracking-tight">$59<span className="text-lg font-bold text-slate-400 ml-1">/mo</span></div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Billed Monthly</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 transition-colors">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Billing</div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {isActive && org?.current_period_end
                                                ? new Date(org.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover/item:text-green-600 transition-colors">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                                        <div className={`text-sm font-bold ${isActive ? 'text-green-600' : 'text-slate-500'}`}>
                                            {isActive ? 'Active & Protected' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <ManageBillingButton mode={isActive ? 'portal' : 'checkout'} />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section */}
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
                    {isActive ? (
                        <div className="sticky top-8 bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-200 mb-8">Summary</h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm font-bold text-blue-100">Monthly Total</div>
                                        <div className="text-4xl font-black tracking-tight">$59</div>
                                    </div>

                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <div className="flex justify-between text-sm font-medium text-blue-100">
                                            <span>Current Cycle Ends</span>
                                            <span className="text-white">
                                                {org?.current_period_end ? new Date(org.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-blue-100">
                                            <span>Payment Method</span>
                                            <span className="text-white flex items-center gap-2">
                                                <CardIcon className="h-3.5 w-3.5" />
                                                Secure
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-[10px] font-bold text-blue-100 leading-relaxed text-center uppercase tracking-widest">
                                        Next charge will be automated
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sticky top-8 bg-slate-50 border border-slate-200 border-dashed rounded-[2.5rem] p-10 text-center">
                            <div className="h-16 w-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Zap className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">No Active Plan</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                Subscribe to unlock full access to the Drivofy platform and start managing your school.
                            </p>
                            <ManageBillingButton mode="checkout" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

