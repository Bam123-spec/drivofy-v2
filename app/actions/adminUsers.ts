'use server'

import { createAdminClient } from '@/lib/supabase/admin'
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
        const supabase = createAdminClient()
        const liveUrl = 'https://selamdriving.drivofy.com';
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${liveUrl}/update-password`
            }
        })

        if (error) throw error

        if (data?.properties?.action_link) {
            const { sendTransactionalEmail } = await import('@/lib/brevo');

            await sendTransactionalEmail({
                to: [{ email: email, name: email }], // We might not have the name, so using email as fallback
                subject: 'Reset Your Drivofy Password',
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h1 style="color: #1e293b; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Reset Your Password</h1>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                            We received a request to reset the password for your Drivofy account.
                        </p>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                            Click the button below to set a new password. This link is valid for 24 hours.
                        </p>
                        <a href="${data.properties.action_link}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                            Reset Password
                        </a>
                        <p style="color: #64748b; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                            If you didn't request a password reset, you can safely ignore this email.
                        </p>
                    </div>
                `
            });
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error in sendPasswordReset:', error)
        return { success: false, error: error.message }
    }
}
