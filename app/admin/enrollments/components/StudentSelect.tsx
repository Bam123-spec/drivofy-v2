"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export type StudentOption = {
    id: string
    name: string
    email: string
}

interface StudentSelectProps {
    students: StudentOption[]
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function StudentSelect({ students, value, onChange, disabled }: StudentSelectProps) {
    const [open, setOpen] = React.useState(false)

    const selectedStudent = students.find((student) => student.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedStudent ? (
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{selectedStudent.name}</span>
                            <span className="text-xs text-muted-foreground">{selectedStudent.email}</span>
                        </div>
                    ) : (
                        "Select student..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput placeholder="Search student..." />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No student found.</CommandEmpty>
                        <CommandGroup>
                            {students.map((student) => (
                                <CommandItem
                                    key={student.id}
                                    value={(student.name + " " + student.email).toLowerCase()} // Search by name and email
                                    onSelect={() => {
                                        onChange(student.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === student.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{student.name}</span>
                                        <span className="text-xs text-muted-foreground">{student.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
