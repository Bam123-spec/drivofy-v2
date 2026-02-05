export type UserRole = 'admin' | 'instructor' | 'student';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: UserRole;
    status: 'active' | 'completed' | 'dropped' | 'inactive';
    created_at: string;
}

export interface Instructor {
    id: string;
    profile_id?: string; // Link to auth user
    full_name: string;
    email?: string;
    phone?: string;
    bio?: string;
    license_number?: string;
    color_code?: string; // For calendar display
    created_at: string;
    // Scheduling Rules
    working_days?: number[];
    start_time?: string;
    end_time?: string;
    slot_minutes?: number;
    break_start?: string;
    break_end?: string;
    min_notice_hours?: number;
    is_active?: boolean;
}

export interface ServicePackage {
    id: string;
    plan_key: string;
    display_name: string;
    instructor_id: string | null;
    duration_minutes: number;
    credits_granted?: number;
    created_at: string;
    service_package_instructors?: {
        instructor_id: string;
        instructors?: Instructor;
    }[];
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description?: string;
    type: 'drivers_ed' | 'alcohol_drug';
    total_sessions: number;
    price: number;
    created_at: string;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    status: 'active' | 'completed' | 'expired';
    enrolled_at: string;
    completed_at?: string;
    courses?: Course;
    profiles?: Profile;
}

export interface Booking {
    id: string;
    user_id: string; // Can be null for guest bookings?
    service_type: string;
    booking_date: string;
    booking_time: string;
    instructor?: string; // Legacy text field
    instructor_id?: string; // New FK to instructors table
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
    profiles?: Profile;
}

export interface BtwSession {
    id: string;
    student_id: string;
    instructor_id?: string;
    plan_key?: string; // Link to service_packages
    starts_at: string;
    ends_at: string;
    session_type: 'included' | 'extra_paid';
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    created_at: string;
    instructors?: Instructor;
    profiles?: Profile; // Student
}
