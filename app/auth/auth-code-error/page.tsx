import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

type AuthCodeErrorPageProps = {
    searchParams?: {
        reason?: string
        message?: string
        login?: string
    }
}

export default function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
    const loginHref = searchParams?.login || "https://portifol.com/student/login"
    const customMessage = searchParams?.message
    const safeMessage = customMessage
        ? (() => {
            try {
                return decodeURIComponent(customMessage)
            } catch {
                return customMessage
            }
        })()
        : null

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-xl border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">This access link has expired</CardTitle>
                    <CardDescription className="text-slate-600">
                        Sorry, this link is no longer valid. Please sign in to your student portal to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {safeMessage ? (
                        <p className="text-sm text-slate-500">{safeMessage}</p>
                    ) : null}
                    <Button asChild className="w-full">
                        <a href={loginHref}>Go to Student Portal Login</a>
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
