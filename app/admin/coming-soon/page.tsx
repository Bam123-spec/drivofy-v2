"use client"

import { Button } from "@/components/ui/button"
import { Construction, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ComingSoonPage() {
    const router = useRouter()

    return (
        <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Construction className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Enterprise Feature</h1>
                <p className="text-gray-500">
                    This module is part of the Enterprise Suite and is currently under development.
                    Check back soon for updates.
                </p>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
                <Button asChild>
                    <Link href="/admin">Return to Dashboard</Link>
                </Button>
            </div>
        </div>
    )
}
