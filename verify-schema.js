const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
    console.log('--- Database Verification Report ---');

    // 1. Enrollments
    const { data: enrollment, error: eError } = await supabase.from('enrollments').select('*').limit(1).single();
    if (!eError || eError.code === 'PGRST116') {
        const keys = enrollment ? Object.keys(enrollment) : [];
        console.log('enrollments.btw_credits_granted:', keys.includes('btw_credits_granted') ? 'PASS' : 'FAIL');
    } else {
        console.log('enrollments fetch error:', eError.message);
    }

    // 2. Profiles
    const { data: profile, error: pError } = await supabase.from('profiles').select('*').limit(1).single();
    if (!pError || pError.code === 'PGRST116') {
        const keys = profile ? Object.keys(profile) : [];
        console.log('profiles.btw_cooldown_until:', keys.includes('btw_cooldown_until') ? 'PASS' : 'FAIL');
    } else {
        console.log('profiles fetch error:', pError.message);
    }

    // 3. Email Queue
    const { data: emailQ, error: eqError } = await supabase.from('email_queue').select('*').limit(1);
    console.log('email_queue table exists:', !eqError ? 'PASS' : 'FAIL');

    // 4. Instructors
    const { data: instructor, error: iError } = await supabase.from('instructors').select('*').limit(1).single();
    if (!iError || iError.code === 'PGRST116') {
        const keys = instructor ? Object.keys(instructor) : [];
        const required = ['working_days', 'start_time', 'end_time', 'slot_minutes', 'break_start', 'break_end', 'min_notice_hours', 'is_active'];
        const missing = required.filter(k => !keys.includes(k));
        console.log('instructors columns:', missing.length === 0 ? 'PASS' : `FAIL (missing: ${missing.join(', ')})`);
    } else {
        console.log('instructors fetch error:', iError.message);
    }

    // 5. Driving Sessions
    const { data: session, error: sError } = await supabase.from('driving_sessions').select('*').limit(1).single();
    if (!sError || sError.code === 'PGRST116') {
        const keys = session ? Object.keys(session) : [];
        console.log('driving_sessions.plan_key:', keys.includes('plan_key') ? 'PASS' : 'FAIL');
    } else {
        console.log('driving_sessions fetch error:', sError.message);
    }

    // 6. Service Packages
    const { data: sp, error: spError } = await supabase.from('service_packages').select('*').limit(1);
    console.log('service_packages table exists:', !spError ? 'PASS' : 'FAIL');

    process.exit(0);
}

verify();
