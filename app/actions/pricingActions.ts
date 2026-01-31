'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type ClassType = 'DE' | 'RSEP' | 'DIP'

export interface ClassPricingSummary {
    class_type: ClassType
    current_price: number
    upcoming_count: number
}

export interface ServicePricingSummary {
    id: string
    slug: string
    title: string
    price: number
    type: string | null
}

/**
 * Get pricing summary for all class types
 */
export async function getClassPricingSummary(): Promise<ClassPricingSummary[]> {
    const supabase = createClient(await cookies())

    const { data, error } = await supabase
        .from('classes')
        .select('class_type, price')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .eq('is_archived', false)
        .order('class_type')

    if (error) {
        console.error('[PRICING] Error fetching class pricing:', error)
        // Return empty array instead of throwing to allow UI to render
        return []
    }

    if (!data || data.length === 0) {
        console.log('[PRICING] No upcoming classes found')
        return []
    }

    // Group by class_type and get the first price (they should all be the same for a type)
    const summary: Record<ClassType, ClassPricingSummary> = {} as any

    data.forEach((item) => {
        const classType = item.class_type as ClassType
        // Skip items without class_type or price
        if (!classType || item.price === null || item.price === undefined) {
            return
        }

        if (!summary[classType]) {
            summary[classType] = {
                class_type: classType,
                current_price: Number(item.price) || 0,
                upcoming_count: 0
            }
        }
        summary[classType].upcoming_count++
    })

    return Object.values(summary)
}

/**
 * Update all future classes of a specific type with new price
 */
export async function updateClassTypePricing(
    classType: ClassType,
    newPrice: number
): Promise<{ success: boolean; updated_count: number; error?: string }> {
    // Validation
    if (!classType || !['DE', 'RSEP', 'DIP'].includes(classType)) {
        return { success: false, updated_count: 0, error: 'Invalid class type' }
    }

    if (newPrice <= 0 || newPrice > 9999.99) {
        return { success: false, updated_count: 0, error: 'Price must be between $0.01 and $9999.99' }
    }

    const supabase = createClient(await cookies())

    // Round to 2 decimal places
    const formattedPrice = Math.round(newPrice * 100) / 100

    const { data, error } = await supabase
        .from('classes')
        .update({
            price: formattedPrice,
        })
        .eq('class_type', classType)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .eq('is_archived', false)
        .select('id')

    if (error) {
        console.error(`[PRICING] Error updating ${classType} pricing:`, error)
        return { success: false, updated_count: 0, error: error.message }
    }

    revalidatePath('/admin/pricing')
    revalidatePath('/admin/classes')

    return {
        success: true,
        updated_count: data?.length || 0
    }
}

/**
 * Get all service/course packages with pricing
 */
export async function getServicePricingSummary(): Promise<ServicePricingSummary[]> {
    const supabase = createClient(await cookies())

    const { data, error } = await supabase
        .from('courses')
        .select('id, slug, title, price, type')
        .eq('is_published', true)
        .order('slug')

    if (error) {
        console.error('[PRICING] Error fetching service pricing:', error)
        throw new Error('Failed to fetch service pricing')
    }

    return (data || []).map(item => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        price: Number(item.price) || 0,
        type: item.type
    }))
}

/**
 * Update price for a specific service/course
 */
export async function updateServicePricing(
    serviceId: string,
    newPrice: number
): Promise<{ success: boolean; error?: string }> {
    // Validation
    if (!serviceId) {
        return { success: false, error: 'Invalid service ID' }
    }

    if (newPrice <= 0 || newPrice > 9999.99) {
        return { success: false, error: 'Price must be between $0.01 and $9999.99' }
    }

    const supabase = createClient(await cookies())

    // Round to 2 decimal places
    const formattedPrice = Math.round(newPrice * 100) / 100

    const { error } = await supabase
        .from('courses')
        .update({ price: formattedPrice })
        .eq('id', serviceId)

    if (error) {
        console.error(`[PRICING] Error updating service pricing:`, error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/pricing')
    revalidatePath('/services')

    return { success: true }
}
