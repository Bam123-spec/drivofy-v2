'use client'

export const runtime = 'edge';

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"

const StudentProfile = dynamic(() => import('./StudentProfile'), {
    ssr: false,
    loading: () => (
        <div className="h-[50vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
    ),
})

export default function Page() {
    return <StudentProfile />
}
