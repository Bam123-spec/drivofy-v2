import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutTemplate } from "lucide-react"

export default function EditorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Site Editor</h1>
                <p className="text-gray-500 mt-1">Customize your website content and layout.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5" />
                        Editor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Site editor features coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
