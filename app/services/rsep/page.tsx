import { getClasses } from "@/app/actions/classes"
import { ClassList } from "@/components/services/class-list"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
    title: "3-Hour Alcohol & Drug Program (RSEP) | Drivofy",
    description: "Complete your MVA-required 3-Hour Alcohol & Drug Education Program online.",
}

export default async function RSEPPage() {
    const classes = await getClasses('RSEP')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">3-Hour Alcohol & Drug Program (RSEP)</h1>
                    <p className="text-xl text-muted-foreground">
                        Required for drivers converting an international license or as mandated by the MVA.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">About the Course</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The 3-Hour Alcohol and Drug Education Program is designed for individuals who have a valid driver's license from another country and are applying for a Maryland driver's license. It is also for those who have been referred by the MVA.
                        </p>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            <li>MVA-Approved Curriculum</li>
                            <li>3-Hour Single Session</li>
                            <li>Certificate provided upon completion</li>
                            <li>Online via Zoom</li>
                        </ul>
                    </div>
                    <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                        <h2 className="text-2xl font-semibold mb-6">Upcoming Classes</h2>
                        <ClassList classes={classes || []} courseType="RSEP" userId={user?.id} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
