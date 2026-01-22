import { PricingEditor } from "./components/PricingEditor"
import {
    LayoutTemplate,
    Sparkles,
    Palette,
    Type,
    Image as ImageIcon,
    Settings2,
    Monitor
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditorPage() {
    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Super Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Monitor className="h-3 w-3" />
                        Website Management
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                        Edit <span className="text-blue-600">Site</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-lg">
                        Fine-tune your website's appearance, messaging, and global settings from one premium interface.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Palette className="h-5 w-5" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <Type className="h-5 w-5" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <ImageIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Editor Tabs */}
            <Tabs defaultValue="pricing" className="space-y-10">
                <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-slate-200 sticky top-20 z-40 flex items-center justify-between shadow-xl shadow-slate-200/50">
                    <TabsList className="bg-transparent h-12 gap-2">
                        <TabsTrigger
                            value="pricing"
                            className="rounded-full px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <Settings2 className="h-3.5 w-3.5 mr-2" />
                            Pricing
                        </TabsTrigger>
                        <TabsTrigger
                            value="content"
                            disabled
                            className="rounded-full px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <LayoutTemplate className="h-3.5 w-3.5 mr-2" />
                            Content
                        </TabsTrigger>
                        <TabsTrigger
                            value="appearance"
                            disabled
                            className="rounded-full px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                            Appearance (Soon)
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pricing" className="mt-0 focus-visible:outline-none">
                    <PricingEditor />
                </TabsContent>
            </Tabs>
        </div>
    )
}
