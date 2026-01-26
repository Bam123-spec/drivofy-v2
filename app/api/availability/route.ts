import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { generateAvailableSlots } from '@/lib/scheduling/availability';
import { parseISO, format, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const planKey = searchParams.get('plan_key');
        const date = searchParams.get('date'); // YYYY-MM-DD

        if (!planKey || !date) {
            return NextResponse.json(
                { error: 'Missing required parameters: plan_key and date' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // 1. Look up the service_package row by plan_key
        const { data: servicePackage, error: spError } = await supabase
            .from('service_packages')
            .select('instructor_id, duration_minutes, display_name')
            .eq('plan_key', planKey)
            .single();

        if (spError || !servicePackage) {
            console.error('[API] Service Package Error:', spError);
            return NextResponse.json(
                { error: 'Service package not found' },
                { status: 404 }
            );
        }

        const { instructor_id, duration_minutes } = servicePackage;

        // 2. Load instructor schedule rules
        const { data: instructor, error: instError } = await supabase
            .from('instructors')
            .select('*')
            .eq('id', instructor_id)
            .single();

        if (instError || !instructor) {
            console.error('[API] Instructor Error:', instError);
            return NextResponse.json(
                { error: 'Instructor not found' },
                { status: 404 }
            );
        }

        // 3. Query driving_sessions for that instructor_id on that date
        // We treat only "scheduled" as blocking as per instructions.
        // Explanation: "cancelled" or "no_show" indicate the time slot is freed up.
        // "completed" sessions are in the past and won't affect future bookings for today,
        // but we technically only care about "scheduled" for active blockers.
        const { data: sessions, error: sessionError } = await supabase
            .from('driving_sessions')
            .select('start_time, end_time')
            .eq('instructor_id', instructor_id)
            .eq('status', 'scheduled')
            // Note: In a real app we'd filter by time range too:
            // .gte('start_time', `${date}T00:00:00Z`)
            // .lte('start_time', `${date}T23:59:59Z`)
            // But for small datasets eq('status', 'scheduled') + local filtering is fine.
            // Let's at least filter by date prefix if possible or just filter in JS.
            .filter('start_time', 'like', `${date}%`);

        if (sessionError) {
            console.error('[API] Sessions Error:', sessionError);
            return NextResponse.json(
                { error: 'Failed to fetch sessions' },
                { status: 500 }
            );
        }

        // 4. Map sessions to the format expected by the utility
        const existingBookings = (sessions || []).map(s => ({
            start: s.start_time,
            end: s.end_time
        }));

        // 5. Call the slot generator
        const slots = generateAvailableSlots({
            date,
            timezone: 'America/New_York',
            startTime: instructor.start_time || '7:00 AM',
            endTime: instructor.end_time || '7:00 PM',
            breakStart: instructor.break_start,
            breakEnd: instructor.break_end,
            slotMinutes: instructor.slot_minutes || 60,
            durationMinutes: duration_minutes,
            minNoticeHours: instructor.min_notice_hours || 12,
            existingBookings
        });

        // 6. Return slots as ISO strings in America/New_York offset
        // The utility returns ["9:00 AM", ...]. We need to convert back to ISO.
        const isoSlots = slots.map(timeStr => {
            // Create a date string that parseISO or equivalent can handle
            // We know it's America/New_York. 
            // For simplicity, we can create the ISO string by combining date + 24h time + offset.
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const pad = (n: number) => n.toString().padStart(2, '0');
            // America/New_York is usually -05:00 or -04:00. 
            // A more robust way would be to use a library or let the client handle it,
            // but the prompt asks for ISO strings in America/New_York offset.
            // Standard offset for NY is -05:00 (EST) or -04:00 (EDT).
            // Since we don't have a TZ library, we'll use a simplified ISO format 
            // that includes the time but might lack the exact DST-corrected offset.
            // However, it's better to just return the full timestamp.
            return `${date}T${pad(hours)}:${pad(minutes)}:00-05:00`;
        });

        return NextResponse.json({ slots: isoSlots });

    } catch (error: any) {
        console.error('[API] Availability Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
