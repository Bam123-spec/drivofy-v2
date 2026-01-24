'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAdminUser(userId: string) {
    try {
        const supabase = createAdminClient()

        // 1. Delete from Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)
        if (authError) throw authError

        // 2. Profile should be deleted by cascade if defined, but let's be safe
        // Most schemas have on delete cascade from auth.users to public.profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('Error deleting profile:', profileError)
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteAdminUser:', error)
        return { success: false, error: error.message }
    }
}

export async function updateAdminUser(userId: string, data: { full_name?: string, role?: string }) {
    try {
        const supabase = createAdminClient()

        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (profileError) throw profileError

        // 2. Update Auth Metadata
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                full_name: data.full_name,
                role: data.role
            }
        })

        if (authError) {
            console.error('Error updating auth metadata:', authError)
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateAdminUser:', error)
        return { success: false, error: error.message }
    }
}

export async function sendPasswordReset(email: string) {
    try {
        const supabase = await createClient()
        const liveUrl = 'https://selamdriving.drivofy.com';

        // Use Supabase's native password reset email system
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${liveUrl}/update-password`
        })

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error('Error in sendPasswordReset:', error)
        return { success: false, error: error.message }
    }
}
