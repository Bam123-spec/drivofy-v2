import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, role, full_name, phone, license_number, type } = body

        // Validate inputs
        if (!email || !role || !full_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Initialize Supabase Admin Client
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!serviceRoleKey) {
            console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing")
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing Service Role Key' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        console.log(`[API] Inviting user: ${email} as ${role}`)

        // 1. Invite User via Auth Admin
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                data: {
                    role: role,
                    name: full_name,
                    full_name: full_name, // Redundant but safe
                    phone: phone
                }
            }
        )

        if (authError) {
            console.error('Auth Invite Error:', authError)
            return NextResponse.json(
                { error: authError.message },
                { status: 500 }
            )
        }

        console.log('[API] Auth invite successful, user ID:', authData.user.id)

        const userId = authData.user.id

        // 2. Ensure Profile Exists (Fix for Race Condition)
        // The trigger *should* do this, but sometimes it's slow or fails. 
        // We explicitly upsert here to guarantee the FK constraint for 'instructors' will be met.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                full_name: full_name,
                role: role,
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Profile Upsert Error:', profileError)
            return NextResponse.json(
                { error: 'Failed to create user profile: ' + profileError.message },
                { status: 500 }
            )
        }

        console.log('[API] Profile upsert successful')

        // 3. If Instructor, add to 'instructors' table
        if (role === 'instructor') {
            const { error: instructorError } = await supabaseAdmin
                .from('instructors')
                .insert([
                    {
                        profile_id: userId,
                        full_name: full_name,
                        email: email,
                        phone: phone,
                        license_number: license_number,
                        status: 'active',
                        type: type || 'both'
                    }
                ])

            if (instructorError) {
                console.error('Instructor Insert Error:', instructorError)
                return NextResponse.json(
                    { error: 'Failed to create instructor record: ' + instructorError.message },
                    { status: 500 }
                )
            }
            console.log('[API] Instructor record created')
        }

        return NextResponse.json({ success: true, user: authData.user })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
