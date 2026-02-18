import { NextResponse } from 'next/server'

/**
 * Deprecated route.
 * Student onboarding is centralized through SELAM onboarding endpoint.
 */
export async function GET() {
    return NextResponse.json(
        { error: 'Deprecated endpoint. Use central onboarding flow for student creation.' },
        { status: 410 }
    )
}
