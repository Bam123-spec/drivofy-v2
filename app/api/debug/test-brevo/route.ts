import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/brevo';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await sendTransactionalEmail({
            to: [{ email, name: name || 'Test User' }],
            subject: 'Selam Driving School - Brevo Integration Test',
            htmlContent: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Brevo Integration Test Successful!</h2>
                    <p>If you're reading this, the Brevo API integration is working correctly for <strong>portifol.com</strong>.</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Test email sent successfully', data: result.data });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
