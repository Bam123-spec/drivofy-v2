import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
import { Download, CheckCircle2, AlertCircle, Calendar } from "lucide-react"
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
        .single()

    const isActive = org?.billing_status === 'active' || org?.billing_status === 'trialing'
    const isCanceled = org?.billing_status === 'canceled'

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Subscription</h1>
                <p className="text-gray-500 mt-1">Manage your Drivofy subscription and payment methods.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Plan & Payment Method */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Plan Summary */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold text-gray-900">Current Plan</CardTitle>
                                    <CardDescription>Your subscription details.</CardDescription>
                                </div>
                                <Badge className={`${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">Drivofy Standard</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Your Drivofy subscription controls access for this driving school’s admin and instructor portals.
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">$59<span className="text-sm font-normal text-gray-500">/mo</span></div>
                                </div>
                            </div>
                            {isActive && org?.current_period_end && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span>Renews on <strong>{new Date(org.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-gray-50/50 border-t border-gray-100 flex gap-3 px-6 py-4">
                            <ManageBillingButton mode={isActive ? 'portal' : 'checkout'} />
                        </CardFooter>
                    </Card>

                    {/* Payment Method - Only show if active or has customer ID */}
                    {org?.stripe_customer_id && <PaymentMethodCard />}
                </div>

                {/* Right Column: Upcoming Charge - Only show if active */}
                {isActive && (
                    <div className="space-y-8">
                        <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-blue-900 uppercase tracking-wider">Upcoming Charge</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <SyncBillingButton />
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {org?.billing_status ? org.billing_status.toUpperCase() : 'INACTIVE'}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-3xl font-bold text-blue-900">$59</span>
                                    <span className="text-sm font-medium text-blue-700">USD</span>
                                </div>
                                <div className="text-sm text-blue-800 mb-4">
                                    Due on {org?.current_period_end ? new Date(org.current_period_end).toLocaleDateString() : 'Next Cycle'}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-blue-200/60">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700/80">Plan</span>
                                        <span className="font-medium text-blue-900">Drivofy Standard</span>
                                    </div>
                                </div>

                                <div className="mt-6 text-xs text-center text-blue-600/70 font-medium">
                                    Billed securely via Stripe
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Invoice History - Only show if active */}
            {isActive && INVOICE_HISTORY.length > 0 && (
                <Card className="border-gray-200 shadow-sm mt-8">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="font-semibold text-gray-600">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Invoice ID</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Description</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Amount</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-600 text-right">Download</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {INVOICE_HISTORY.map((invoice) => (
                                    <TableRow key={invoice.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium text-gray-900">
                                            {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-gray-500 font-mono text-xs">{invoice.id}</TableCell>
                                        <TableCell className="text-gray-600">{invoice.description}</TableCell>
                                        <TableCell className="font-medium text-gray-900">${invoice.amount}.00</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`
                                                capitalize font-medium border-0 px-2 py-0.5
                                                ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'}
                                            `}>
                                                {invoice.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                {invoice.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
