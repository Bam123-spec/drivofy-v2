"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, Pencil, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Category {
    id: string
    name: string
}

interface ManageCategoriesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function ManageCategoriesDialog({ open, onOpenChange, onSuccess }: ManageCategoriesDialogProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")

    useEffect(() => {
        if (open) {
            fetchCategories()
        }
    }, [open])

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('class_categories')
            .select('*')
            .order('created_at', { ascending: true })

        if (data) setCategories(data)
    }

    const handleAdd = async () => {
        if (!newCategoryName.trim()) return

        try {
            setLoading(true)
            const { error } = await supabase
                .from('class_categories')
                .insert([{ name: newCategoryName.trim() }])

            if (error) throw error

            toast.success("Category created")
            setNewCategoryName("")
            fetchCategories()
            onSuccess()
        } catch (error: any) {
            toast.error("Failed to create category")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('class_categories')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success("Category deleted")
            fetchCategories()
            onSuccess()
        } catch (error) {
            toast.error("Failed to delete category")
        }
    }

    const startEdit = (category: Category) => {
        setEditingId(category.id)
        setEditName(category.name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName("")
    }

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return

        try {
            const { error } = await supabase
                .from('class_categories')
                .update({ name: editName.trim() })
                .eq('id', id)

            if (error) throw error

            toast.success("Category updated")
            setEditingId(null)
            fetchCategories()
            onSuccess()
        } catch (error) {
            toast.error("Failed to update category")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>Manage Class Groups</DialogTitle>
                    <DialogDescription>
                        Create and rename the rows (groups) for your classes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="New Group Name (e.g. Morning Classes)"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd} disabled={loading || !newCategoryName.trim()}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100 group">
                                {editingId === cat.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-8"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(cat.id)}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={cancelEdit}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-medium text-sm">{cat.name}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => startEdit(cat)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(cat.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="text-center text-sm text-gray-500 py-4">
                                No groups created yet.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
