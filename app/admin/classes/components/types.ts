export type Instructor = {
    id: string
    full_name: string
    email?: string
}

export type Class = {
    id: string
    name: string
    class_type: 'DE' | 'RSEP' | 'DIP'
    start_date: string
    end_date: string
    time_slot: string
    instructor_id: string | null
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
    created_at?: string
    instructors?: Instructor
}

export type ClassFormData = {
    name: string
    class_type: 'DE' | 'RSEP' | 'DIP'
    start_date: string
    end_date: string
    time_slot: string
    instructor_id: string
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
    recurrence_enabled?: boolean
    recurrence_interval_value?: number
    recurrence_interval_unit?: 'days' | 'weeks'
    recurrence_count?: number
}
