import nodemailer from 'nodemailer';

// Taken from https://www.geeksforgeeks.org/javascript-program-to-validate-an-email-address/
const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

export function validateEmailRegexp(email: string) {
    return EMAIL_REGEXP.test(email)
}

export function getEmailTransporter() {
    return nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "ashutosh.ukey@circle.com",
            // TODO future: come up with a better, long-term mailing service / solution (maybe we can even use Cirlce resources).
            // Currently, we will get throttled by Google if we have 500+ emails in one day.
            pass: process.env.GMAIL_APP_INTEGRATION_PASSWORD,
        },
    });
}

export function validateEmail(emailAddress: string): boolean {
    emailAddress = normalizeEmail(emailAddress)
    return validateEmailRegexp(emailAddress) && emailAddress.endsWith("@circle.com")
}

export function normalizeEmail(emailAddress: string) {
    return emailAddress.trim().replace(/\+.*@/, '@')    // remove the alias part
}

export function maskEmail(emailAddress: string) {
    return emailAddress?.replace(/^(.)(.*)(.@.*)$/,
        (_, a, b, c) => a + b.replace(/./g, '*').replace(/\*+/g, '****') + c
    )
}