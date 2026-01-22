import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const apiKey = process.env.BREVO_API_KEY;

if (apiKey) {
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
}

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
    if (!apiKey) {
        console.error('BREVO_API_KEY is not set');
        return { success: false, error: 'API key missing' };
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = sender || {
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@portifol.com',
        name: process.env.BREVO_SENDER_NAME || 'Drivofy',
    };
    sendSmtpEmail.to = to;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('API called successfully. Returned data: ', data);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error while calling Brevo API:', error.response ? error.response.body : error);
        return { success: false, error: error.message || 'Failed to send email' };
    }
}
