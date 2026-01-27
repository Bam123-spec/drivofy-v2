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

export function generateBtwCooldownReadyEmail(userName: string) {
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://drivofy.com'}/dashboard/book-driving?plan_key=btw`;

    return {
        subject: "You can book your next Behind-the-Wheel session",
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Hello ${userName},</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    Your 24-hour cooldown period has ended. You are now eligible to book your next Behind-the-Wheel session!
                </p>
                <div style="margin: 30px 0;">
                    <a href="${dashboardLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Book Your Next Session
                    </a>
                </div>
                <p style="font-size: 14px; color: #888;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${dashboardLink}" style="color: #0070f3;">${dashboardLink}</a>
                </p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa;">
                    This is an automated notification from Drivofy.
                </p>
            </div>
        `
    };
}

export function generateGradePassingEmail(userName: string, courseName: string, grade: string) {
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://drivofy.com'}/dashboard/book-driving?plan_key=btw`;

    return {
        subject: `Congratulations! You've passed ${courseName}`,
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #166534;">Congratulations ${userName}! 🎉</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    You have successfully passed <strong>${courseName}</strong> with a grade of <strong>${grade}</strong>.
                </p>
                <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #bbf7d0;">
                    <p style="margin: 0; color: #166534; font-weight: bold; text-align: center;">
                        You can now book your Behind-the-Wheel sessions!
                    </p>
                </div>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${dashboardLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Book Behind-the-Wheel
                    </a>
                </div>
                <p style="font-size: 14px; color: #888;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${dashboardLink}" style="color: #0070f3;">${dashboardLink}</a>
                </p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa;">
                    Any Behind-the-Wheel credits associated with this milestone have been added to your account.
                </p>
            </div>
        `
    };
}

export function generateGradeFailingEmail(userName: string, courseName: string, grade: string) {
    return {
        subject: `Update regarding ${courseName}`,
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Hello ${userName},</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    Thank you for completing <strong>${courseName}</strong>. Your recorded grade is <strong>${grade}</strong>.
                </p>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    Per Maryland MVA requirements, a passing grade of 80% or higher is required to move forward with Behind-the-Wheel training.
                </p>
                <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #fecaca;">
                    <p style="margin: 0; color: #991b1b; font-weight: bold; text-align: center;">
                        A final exam retake is required ($50 fee).
                    </p>
                </div>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    Please contact our office or speak with your instructor to schedule your retake and process the payment.
                </p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa;">
                    If you believe this grade was recorded in error, please contact us immediately.
                </p>
            </div>
        `
    };
}
