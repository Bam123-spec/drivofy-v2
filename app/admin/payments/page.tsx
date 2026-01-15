'use client'

import { useState } from "react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Download, CheckCircle2, AlertCircle, Calendar } from "lucide-react"
import { toast } from "sonner"
import ManageBillingButton from "./components/ManageBillingButton"

// Mock Data Interfaces
interface BillingPaymentMethod {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover'
    last4: string
    expMonth: number
    expYear: number
    cardholderName: string
}

interface UpcomingInvoice {
    amount: number
    currency: 'USD'
    nextChargeDate: string // ISO
    planName: string
    interval: 'month' | 'year'
    billingEmail: string
}

interface BillingInvoice {
    id: string
    date: string
    description: string
    amount: number
    currency: 'USD'
    status: 'paid' | 'failed' | 'refunded'
}

// Mock Data
const PAYMENT_METHOD: BillingPaymentMethod = {
    brand: 'visa',
    last4: '4242',
    expMonth: 2,
    expYear: 28,
    cardholderName: 'Sarah Connor'
}

const UPCOMING_INVOICE: UpcomingInvoice = {
    amount: 59,
    currency: 'USD',
    nextChargeDate: '2026-02-10',
    planName: 'Drivofy Standard',
    interval: 'month',
    billingEmail: 'owner@drivingschool.com'
}

const INVOICE_HISTORY: BillingInvoice[] = [
    { id: 'INV-2026-001', date: '2026-01-10', description: 'Drivofy Standard – Monthly subscription', amount: 59, currency: 'USD', status: 'paid' },
    { id: 'INV-2025-012', date: '2025-12-10', description: 'Drivofy Standard – Monthly subscription', amount: 59, currency: 'USD', status: 'paid' },
    { id: 'INV-2025-011', date: '2025-11-10', description: 'Drivofy Standard – Monthly subscription', amount: 59, currency: 'USD', status: 'paid' },
    { id: 'INV-2025-010', date: '2025-10-10', description: 'Drivofy Standard – Monthly subscription', amount: 59, currency: 'USD', status: 'failed' },
    { id: 'INV-2025-009', date: '2025-09-10', description: 'Drivofy Standard – Monthly subscription', amount: 59, currency: 'USD', status: 'paid' },
]

export default function BillingPage() {
    const [updateCardOpen, setUpdateCardOpen] = useState(false)
    const [cardForm, setCardForm] = useState({ number: '', exp: '', cvc: '', name: '' })

    const handleUpdateCard = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Updating card:", cardForm)
        toast.success("Payment method updated successfully")
        setUpdateCardOpen(false)
        setCardForm({ number: '', exp: '', cvc: '', name: '' })
    }

    const handleDownloadInvoice = (id: string) => {
        console.log(`Downloading invoice ${id}`)
        toast.info(`Downloading invoice ${id}...`)
    }

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
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                                    Active
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
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>Renews on <strong>{new Date(UPCOMING_INVOICE.nextChargeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50/50 border-t border-gray-100 flex gap-3 px-6 py-4">
                            <ManageBillingButton />
                            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => toast.info("Cancellation flow is handled in the billing portal")}>
                                Cancel Subscription
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Payment Method */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-900">Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                        {/* Simple Visa Icon Placeholder */}
                                        <div className="font-bold text-blue-800 italic text-sm">VISA</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                            Visa ending in {PAYMENT_METHOD.last4}
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-gray-500">Default</Badge>
                                        </div>
                                        <div className="text-sm text-gray-500">Expires {PAYMENT_METHOD.expMonth}/{PAYMENT_METHOD.expYear} • {PAYMENT_METHOD.cardholderName}</div>
                                    </div>
                                </div>
                                <Dialog open={updateCardOpen} onOpenChange={setUpdateCardOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">Update</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Update Payment Method</DialogTitle>
                                            <DialogDescription>Enter your new card details below.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleUpdateCard} className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name on Card</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Sarah Connor"
                                                    value={cardForm.name}
                                                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="number">Card Number</Label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="number"
                                                        placeholder="0000 0000 0000 0000"
                                                        className="pl-10"
                                                        value={cardForm.number}
                                                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="exp">Expiry Date</Label>
                                                    <Input
                                                        id="exp"
                                                        placeholder="MM/YY"
                                                        value={cardForm.exp}
                                                        onChange={(e) => setCardForm({ ...cardForm, exp: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvc">CVC</Label>
                                                    <Input
                                                        id="cvc"
                                                        placeholder="123"
                                                        value={cardForm.cvc}
                                                        onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Card</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Upcoming Charge */}
                <div className="space-y-8">
                    <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-blue-900 uppercase tracking-wider">Upcoming Charge</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-bold text-blue-900">${UPCOMING_INVOICE.amount}</span>
                                <span className="text-sm font-medium text-blue-700">USD</span>
                            </div>
                            <div className="text-sm text-blue-800 mb-4">
                                Due on {new Date(UPCOMING_INVOICE.nextChargeDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-blue-200/60">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700/80">Plan</span>
                                    <span className="font-medium text-blue-900">{UPCOMING_INVOICE.planName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-700/80">Email</span>
                                    <span className="font-medium text-blue-900 truncate max-w-[150px]" title={UPCOMING_INVOICE.billingEmail}>{UPCOMING_INVOICE.billingEmail}</span>
                                </div>
                            </div>

                            <div className="mt-6 text-xs text-center text-blue-600/70 font-medium">
                                Billed securely via Stripe
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Invoice History */}
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
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900" onClick={() => handleDownloadInvoice(invoice.id)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
