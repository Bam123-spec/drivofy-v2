export type Instructor = {
    id: string
    full_name: string
    email?: string
}

export type Class = {
    id: string
    name: string
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
    start_date: string
    end_date: string
    time_slot: string
    instructor_id: string
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
}
