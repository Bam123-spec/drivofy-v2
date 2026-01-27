import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { bookStudentLesson } from '@/app/actions/studentBooking';
import { withCors, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
    return handleOptions();
}

/**
 * POST /api/book
 * Thin wrapper around bookStudentLesson server action for external client access.
 */
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Authenticate user via session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return withCors(NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            ));
        }

        // 2. Parse and Normalize request body
        let body = await request.json();

        // Support both { start_time, plan_key, instructorId } 
        // AND { date, time, duration, plan_key, instructorId }
        if (body.start_time && !body.date) {
            const startDate = new Date(body.start_time);
            body = {
                ...body,
                date: startDate.toISOString().split('T')[0],
                time: startDate.toISOString().split('T')[1].substring(0, 5),
                duration: body.duration || 2 // Default to 2 hours for BTW if not specified
            };
        }

        // 3. Call existing business logic (server action)
        const result = await bookStudentLesson(body);

        // 4. Return the same success/error response
        if (result.success) {
            return withCors(NextResponse.json(result));
        } else {
            return withCors(NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            ));
        }

    } catch (error: any) {
        console.error('[API] Booking Error:', error);
        return withCors(NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        ));
    }
}
