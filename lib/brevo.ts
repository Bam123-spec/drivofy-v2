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
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@portifol.com',
            name: 'Selam Driving School',
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
    const dashboardLink = 'https://portifol.com/student/behind-the-wheel';

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
                    This is an automated notification from Selam Driving School.
                </p>
            </div>
        `
    };
}

export function generateGradePassingEmail(userName: string, courseName: string, grade: string) {
    const dashboardLink = 'https://portifol.com/student/behind-the-wheel';

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

export function generateBtwFinalEmail(userName: string) {
    const extraPracticeLink = 'https://portifol.com/extra-driving-practice';
    const roadTestLink = 'https://portifol.com/road-test-service';

    return {
        subject: "Congratulations on completing your Behind-the-Wheel training!",
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #166534;">Congratulations ${userName}! 🎉</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    You have successfully completed all required Behind-the-Wheel driving hours. Great job!
                </p>
                <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #bbf7d0;">
                    <p style="margin: 0; color: #166534; font-weight: bold; text-align: center;">
                        To book Roadtest, Please contact us at (202) 630 1930
                    </p>
                </div>
                <h3 style="color: #333; margin-top: 30px;">Next Steps:</h3>
                <ul style="color: #555; line-height: 1.6;">
                    <li>
                        <strong>Need more practice?</strong><br>
                        <a href="${extraPracticeLink}" style="color: #0070f3; text-decoration: none;">Book Extra Driving Practice</a>
                    </li>
                    <li style="margin-top: 10px;">
                        <strong>Ready for your license?</strong><br>
                        <a href="${roadTestLink}" style="color: #0070f3; text-decoration: none;">Book Your Road Test Service</a>
                    </li>
                </ul>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa;">
                    This is an automated notification from Selam Driving School.
                </p>
            </div>
        `
    };
}

export function generateInvitationEmail(userName: string, inviteLink: string, role: string) {
    const roleDisplay = role === 'instructor' ? 'Instructor' : 'Student';

    return {
        subject: `Welcome to Selam Driving School! 🎉`,
        htmlContent: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">SELAM DRIVING SCHOOL</h1>
                    <div style="height: 4px; width: 40px; background: #2563eb; margin: 12px auto 0; border-radius: 2px;"></div>
                </div>

                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Welcome to the Team! 🎉</h2>
                    
                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">
                        Hello ${userName}, you've been invited to join <strong>Selam Driving School</strong> as a <strong>${roleDisplay}</strong>. We're excited to have you on board!
                    </p>

                    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center; border: 1px solid #f1f5f9;">
                        <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Finish Setting Up Your Account</p>
                        <a href="${inviteLink}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
                            Activate Account
                        </a>
                        <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">Link expires in 24 hours</p>
                    </div>

                    <div style="border-top: 1px solid #f1f5f9; pt: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            If you have any questions, feel free to reply to this email or contact our support team.
                        </p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                        &copy; ${new Date().getFullYear()} Selam Driving School. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };
}

export function generateClassEnrollmentEmail(userName: string, className: string, startDate: string) {
    const dashboardLink = 'https://portifol.com/login';

    return {
        subject: `Enrolled in ${className} - Selam Driving School`,
        htmlContent: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">SELAM DRIVING SCHOOL</h1>
                    <div style="height: 4px; width: 40px; background: #2563eb; margin: 12px auto 0; border-radius: 2px;"></div>
                </div>

                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">Class Enrollment Confirmation 📚</h2>
                    
                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">
                        Hello ${userName}, you have been successfully enrolled in <strong>${className}</strong>.
                    </p>

                    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Class Name</p>
                        <p style="margin: 4px 0 16px 0; color: #1e293b; font-weight: bold; font-size: 16px;">${className}</p>
                        
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Start Date</p>
                        <p style="margin: 4px 0 0 0; color: #1e293b; font-weight: bold; font-size: 16px;">${startDate}</p>
                    </div>

                    <div style="text-align: center; margin-bottom: 32px;">
                        <a href="${dashboardLink}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
                            Access Student Portal
                        </a>
                    </div>

                    <div style="border-top: 1px solid #f1f5f9; pt: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            Please log in to your portal to view the full schedule and session details.
                        </p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                        &copy; ${new Date().getFullYear()} Selam Driving School. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };
}
