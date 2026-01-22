'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CreditCard } from "lucide-react"
import { toast } from "sonner"

interface BillingPaymentMethod {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover'
    last4: string
    expMonth: number
    expYear: number
    cardholderName: string
}

const PAYMENT_METHOD: BillingPaymentMethod = {
    brand: 'visa',
    last4: '4242',
    expMonth: 2,
    expYear: 28,
    cardholderName: 'Sarah Connor'
}

export default function PaymentMethodCard() {
    const [updateCardOpen, setUpdateCardOpen] = useState(false)
    const [cardForm, setCardForm] = useState({ number: '', exp: '', cvc: '', name: '' })

    const handleUpdateCard = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Updating card:", cardForm)
        toast.success("Payment method updated successfully")
        setUpdateCardOpen(false)
        setCardForm({ number: '', exp: '', cvc: '', name: '' })
    }

    return (
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
    )
}
