const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    console.log('Checking enrollments table columns...');

    // Try to select a single row to see keys
    const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching enrollments:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found in enrollments:', Object.keys(data[0]));
    } else {
        console.log('No rows found in enrollments, cannot infer columns from data.');
        // Fallback: try to insert a dummy row to see errors? No, that's risky.
        // We can try to select specific columns and see if they error.
    }
}

checkColumns();
