import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateAvailableSlots } from '@/lib/scheduling/availability';
import { parseISO, format } from 'date-fns';
import { withCors, handleOptions } from '@/lib/cors';

export async function OPTIONS() {
    return handleOptions();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const planKey = searchParams.get('plan_key');
        const date = searchParams.get('date'); // YYYY-MM-DD
        const studentIdParam = searchParams.get('student_id');

        if (!planKey || !date) {
            return withCors(NextResponse.json(
                { error: 'Missing required parameters: plan_key and date' },
                { status: 400 }
            ));
        }

        const supabase = createAdminClient();

        // 1. Check for BTW Cooldown if applicable
        if (planKey === 'btw') {
            let studentId = studentIdParam;

            // If no student_id param, try to get from session ONLY IF not in an admin-like context (preview=true)
            const isAvailabilityPreview = searchParams.get('preview') === 'true';

            if (!studentId && !isAvailabilityPreview) {
                const cookieStore = await cookies();
                const supabaseClient = createClient(cookieStore);
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (user) studentId = user.id;
            }

            if (studentId) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('btw_cooldown_until, driving_balance_sessions, role')
                    .eq('id', studentId)
                    .single();

                // Skip credit/cooldown checks for admins or preview mode
                if (profile && profile.role !== 'admin' && !isAvailabilityPreview) {
                    if ((profile.driving_balance_sessions || 0) <= 0) {
                        return withCors(NextResponse.json({
                            slots: [],
                            reason: "no_credits"
                        }));
                    }

                    if (profile.btw_cooldown_until) {
                        const cooldownUntil = new Date(profile.btw_cooldown_until);
                        if (cooldownUntil > new Date()) {
                            return withCors(NextResponse.json({
                                slots: [],
                                reason: "cooldown",
                                next_available_at: profile.btw_cooldown_until
                            }));
                        }
                    }
                }
            }
        }

        // 2. Look up the service_package row by plan_key
        const { data: servicePackage, error: spError } = await supabase
            .from('service_packages')
            .select(`
                id,
                instructor_id,
                duration_minutes,
                display_name,
                service_package_instructors (
                    instructor_id,
                    instructors (
                        id,
                        full_name
                    )
                )
            `)
            .eq('plan_key', planKey)
            .single();

        if (spError || !servicePackage) {
            return withCors(NextResponse.json(
                { error: 'Service package not found' },
                { status: 404 }
            ));
        }

        const durationMinutes = servicePackage.duration_minutes;

        // Get instructor IDs from join table
        const instructorIds = (servicePackage.service_package_instructors || [])
            .map((entry: any) => entry.instructor_id)
            .filter(Boolean);

        // Fallback to legacy instructor_id if join table is empty
        if (instructorIds.length === 0 && servicePackage.instructor_id) {
            instructorIds.push(servicePackage.instructor_id);
        }

        if (instructorIds.length === 0) {
            return withCors(NextResponse.json({ slots: [] }));
        }

        const slotResults: { start_time: string; instructor_id: string; instructor_name?: string }[] = [];
        const isPreview = searchParams.get('preview') === 'true';

        for (const instructorId of instructorIds) {
            const { data: instructor, error: instError } = await supabase
                .from('instructors')
                .select('*')
                .eq('id', instructorId)
                .eq('status', 'active')
                .single();

            if (instError || !instructor) {
                continue;
            }

            // --- WORKING DAYS CHECK ---
            const [y, m, dayNum] = date.split('-').map(Number);
            const dayOfWeek = new Date(y, m - 1, dayNum).getDay(); // 0 is Sunday

            if (!instructor.working_days?.includes(dayOfWeek)) {
                continue;
            }

            const startOfDayStr = `${date}T00:00:00Z`;
            const endOfDayStr = `${date}T23:59:59Z`;

            const { data: sessions, error: sessionError } = await supabase
                .from('driving_sessions')
                .select('start_time, end_time')
                .eq('instructor_id', instructorId)
                .eq('status', 'scheduled')
                .gte('start_time', startOfDayStr)
                .lte('start_time', endOfDayStr);

            if (sessionError) {
                console.error('[API] Sessions Fetch Error:', sessionError);
                continue;
            }

            const existingBookings = (sessions || []).map(s => ({
                start: s.start_time,
                end: s.end_time
            }));

            const slots = generateAvailableSlots({
                date,
                timezone: 'America/New_York',
                startTime: (instructor.start_time || '7:00 AM').trim(),
                endTime: (instructor.end_time || '7:00 PM').trim(),
                breakStart: instructor.break_start?.trim(),
                breakEnd: instructor.break_end?.trim(),
                slotMinutes: instructor.slot_minutes || 60,
                durationMinutes,
                minNoticeHours: isPreview ? 0 : (instructor.min_notice_hours || 12),
                existingBookings
            });

            const isoSlots = slots.map(timeStr => {
                const [time, period] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours < 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                const pad = (n: number) => n.toString().padStart(2, '0');
                // Constructing a localized ISO string (-05:00 for Eastern Time)
                return `${date}T${pad(hours)}:${pad(minutes)}:00-05:00`;
            });

            isoSlots.forEach((start_time) => {
                slotResults.push({
                    start_time,
                    instructor_id: instructorId,
                    instructor_name: instructor.full_name
                });
            });
        }

        return withCors(NextResponse.json({ slots: slotResults }));

    } catch (error: any) {
        console.error('[API] Availability Error:', error);
        return withCors(NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        ));
    }
}
