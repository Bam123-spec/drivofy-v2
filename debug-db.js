const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Instructors ---');
    const { data: instructors, error: instError } = await supabase.from('instructors').select('id, full_name, profile_id');
    if (instError) console.error(instError);
    else console.table(instructors);

    console.log('\n--- Classes ---');
    const { data: classes, error: classError } = await supabase.from('classes').select('id, name, instructor_id');
    if (classError) console.error(classError);
    else console.table(classes);
}

debug();
