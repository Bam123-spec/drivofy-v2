"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"

export type ClassOption = {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
}

interface ClassSelectProps {
    classes: ClassOption[]
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function ClassSelect({ classes, value, onChange, disabled }: ClassSelectProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={classes.length === 0 ? "No active classes available" : "Select class..."} />
            </SelectTrigger>
            <SelectContent>
                {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex flex-col items-start text-left py-1">
                            <span className="font-medium">{cls.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(cls.start_date), "MMM d")} - {format(new Date(cls.end_date), "MMM d, yyyy")}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
