// Brevo Email API using fetch (Edge Runtime compatible)

export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface SendEmailParams {
    to: EmailRecipient[];
    subject: string;
    htmlContent: string;
    sender?: EmailRecipient;
}

export async function sendTransactionalEmail({ to, subject, htmlContent, sender }: SendEmailParams) {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.error('BREVO_API_KEY is not set');
        return { success: false, error: 'API key missing' };
    }

    const payload = {
        sender: sender || {
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@drivofy.com',
            name: process.env.BREVO_SENDER_NAME || 'Drivofy',
        },
        to,
        subject,
        htmlContent
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API Error:', errorData);
            return { success: false, error: errorData.message || 'Failed to send email' };
        }

        const data = await response.json();
        console.log('✅ Brevo email sent successfully:', data);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error calling Brevo API:', error);
        return { success: false, error: error.message || 'Failed to send email' };
    }
}
