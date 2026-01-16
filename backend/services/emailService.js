const nodemailer = require('nodemailer');

const createTransporter = () => {
    // If credentials are missing, we could fallback to Ethereal but for now we'll just log warning and fail gracefully or use console if configured.
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('SMTP credentials not found in env. Email sending will be simulated (logged to console).');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const sendEmail = async (to, subject, html) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`[SIMULATED EMAIL] To: ${to}, Subject: ${subject}`);
        console.log('--- Body ---');
        console.log(html);
        console.log('------------');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"COCIN Danbong School" <no-reply@edves.com>',
            to,
            subject,
            html
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw, just log, so application flow doesn't break? Or maybe throw?
        // Ideally we want to know if it failed.
        throw error;
    }
};

const sendApplicationApprovalEmail = async (to, studentName, interviewDate, parentName) => {
    const subject = 'Application Approved - Interview Scheduled';
    const dateStr = new Date(interviewDate).toLocaleString();
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Application Update</h2>
            <p>Dear ${parentName},</p>
            <p>We are pleased to inform you that the application for <strong>${studentName}</strong> has been reviewed and <strong>approved</strong>.</p>
            <p>The next step is an interview/exam scheduled for:</p>
            <h3 style="background: #f3f4f6; padding: 10px; display: inline-block;">${dateStr}</h3>
            <p>Please arrive at the school premises at least 15 minutes before the scheduled time with the original copies of the submitted documents.</p>
            <p>If you cannot make this date, please contact the school administration immediately.</p>
            <br/>
            <p>Best regards,</p>
            <p>COCIN Danbong School Admissions Team</p>
        </div>
    `;
    return sendEmail(to, subject, html);
};

const sendPasswordResetEmail = async (to, resetLink, name) => {
    const subject = 'Password Reset Request';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Password Reset</h2>
            <p>Hello ${name},</p>
            <p>You requested a password reset. Please click the button below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
            <p>Or verify using this link: <a href="${resetLink}">${resetLink}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br/>
            <p>Best regards,</p>
            <p>COCIN Danbong School Team</p>
        </div>
    `;
    return sendEmail(to, subject, html);
};

const sendAdminApplicationNotification = async (adminEmail, appDetails) => {
    const subject = 'New Student Application Submitted';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">New Application Received</h2>
            <p><strong>Applicant:</strong> ${appDetails.firstName} ${appDetails.lastName}</p>
            <p><strong>Grade:</strong> ${appDetails.grade}</p>
            <p><strong>Parent:</strong> ${appDetails.parentName} (${appDetails.parentEmail})</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <br/>
            <p>Please login to the Admin Dashboard to review this application.</p>
        </div>
    `;
    return sendEmail(adminEmail, subject, html);
};

const sendAdminContactNotification = async (adminEmail, contactDetails) => {
    const subject = 'New Contact Us Message';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">New Contact Message</h2>
            <p><strong>From:</strong> ${contactDetails.name} (${contactDetails.email})</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #2563eb;">${contactDetails.message}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `;
    return sendEmail(adminEmail, subject, html);
};

module.exports = {
    sendEmail,
    sendApplicationApprovalEmail,
    sendPasswordResetEmail,
    sendAdminApplicationNotification,
    sendAdminContactNotification
};
