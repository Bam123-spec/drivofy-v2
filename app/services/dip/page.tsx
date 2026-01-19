import { getClasses } from "@/app/actions/classes"
import { ClassList } from "@/components/services/class-list"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
    title: "Driver Improvement Program (DIP) | Drivofy",
    description: "MVA-approved Driver Improvement Program for point reduction or court referrals.",
}

import { cookies } from "next/headers"

export default async function DIPPage() {
    const classes = await getClasses('DIP')
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Driver Improvement Program (DIP)</h1>
                    <p className="text-xl text-muted-foreground">
                        For drivers referred by the court/MVA or seeking point reduction.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">About the Course</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Driver Improvement Program (DIP) is an instructional program intended to provide driver rehabilitation. You may have been assigned to take this program by a judge, or by the MVA.
                        </p>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            <li>MVA-Approved Curriculum</li>
                            <li>4-8 Hour Session (varies)</li>
                            <li>Certificate sent to MVA electronically</li>
                            <li>Interactive and engaging content</li>
                        </ul>
                    </div>
                    <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                        <h2 className="text-2xl font-semibold mb-6">Upcoming Classes</h2>
                        <ClassList classes={classes || []} courseType="DIP" userId={user?.id} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
