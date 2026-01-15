"use client"

import Link from "next/link"
import { MoreHorizontal, Mail, Phone, Star, Users, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InstructorCardProps {
    instructor: {
        id: string
        full_name: string
        email: string
        phone?: string
        type: string
        status: string
        avatar_url?: string
        rating?: number
        active_students?: number
    }
}

export function InstructorCard({ instructor }: InstructorCardProps) {
    return (
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={instructor.avatar_url} />
                            <AvatarFallback className={`text-lg font-medium ${instructor.type === 'driving' ? 'bg-purple-100 text-purple-600' :
                                    instructor.type === 'theory' ? 'bg-indigo-100 text-indigo-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                {instructor.full_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{instructor.full_name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${instructor.type === 'driving' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                                        instructor.type === 'theory' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' :
                                            'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}>
                                    {instructor.type}
                                </Badge>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${instructor.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${instructor.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    {instructor.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/instructors/${instructor.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-50">
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50/50">
                        <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-sm font-bold">{instructor.rating || "4.9"}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Rating</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50/50">
                        <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-sm font-bold">{instructor.active_students || "12"}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Students</span>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        <span className="truncate">{instructor.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        <span>{instructor.phone || "No phone"}</span>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
                <Button asChild variant="outline" size="sm" className="w-full bg-white hover:bg-gray-50 text-xs h-8">
                    <Link href={`/admin/instructors/${instructor.id}`}>
                        View Full Profile
                    </Link>
                </Button>
            </div>
        </div>
    )
}
