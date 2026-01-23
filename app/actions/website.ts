'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Types
export interface OfferingFeatures {
    text: string
    color?: string
    icon?: string
}

export type Offering = {
    id: string
    title: string
    description?: string
    price_numeric: number
    price_display: string
    image_url?: string
    enroll_link?: string
    learn_more_link?: string
    features: OfferingFeatures[]
    slug: string
    popular: boolean
    category?: string
    created_at: string
    updated_at: string
}

export async function getOfferingsForPage(pageName: string, sectionName: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('website_page_sections')
        .select(`
            id,
            display_order,
            website_offerings (*)
        `)
        .eq('page_name', pageName)
        .eq('section_name', sectionName)
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching offerings:', error)
        return []
    }

    return data.map((item: any) => item.website_offerings)
}

export async function getAllOfferings() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return []

    const { data, error } = await supabase
        .from('website_offerings')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching all offerings:', error)
        return []
    }

    return data as Offering[]
}

export async function getOfferingById(id: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    const { data, error } = await supabase
        .from('website_offerings')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching offering:', error)
        return null
    }

    return data as Offering
}

export async function updateOffering(id: string, updates: { price_numeric: number, price_display: string }) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Unauthorized' }
    }

    // Role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('website_offerings')
        .update({
            price_numeric: updates.price_numeric,
            price_display: updates.price_display,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating offering:', error)
        return { error: 'Failed to update offering' }
    }

    revalidatePath('/admin/editor')
    revalidatePath('/')
    return { success: true }
}

export async function updateOfferingDetails(id: string, updates: Partial<Offering>) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('website_offerings')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating offering details:', error)
        return { error: 'Failed to update offering' }
    }

    revalidatePath('/admin/pricing')
    revalidatePath('/admin/editor')
    revalidatePath('/')

    return { success: true }
}
