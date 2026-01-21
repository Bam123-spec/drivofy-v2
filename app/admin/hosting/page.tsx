import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server } from "lucide-react"

export default function HostingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hosting</h1>
                <p className="text-gray-500 mt-1">Manage your website hosting and domain settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Hosting Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Hosting management features coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
