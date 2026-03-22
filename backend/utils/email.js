const nodemailer = require('nodemailer');

// Create a transporter — using Gmail as default
// For production, use proper SMTP credentials via env vars
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
        }
    });
};

const sendAdmissionEmail = async (patientEmail, patientName, patientId, plainPassword, hospitalName) => {
    // Skip if no SMTP credentials configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 Email skipped: SMTP credentials not configured. Set SMTP_USER and SMTP_PASS env vars.');
        return { sent: false, reason: 'SMTP not configured' };
    }

    if (!patientEmail) {
        console.log('📧 Email skipped: No patient email provided.');
        return { sent: false, reason: 'No email provided' };
    }

    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${hospitalName}" <${process.env.SMTP_USER}>`,
            to: patientEmail,
            subject: `Welcome to ${hospitalName} — Your Patient Portal Credentials`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; color: white;">🏥 ${hospitalName}</h1>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Patient Follow-up System</p>
                    </div>
                    
                    <div style="padding: 32px;">
                        <h2 style="color: #f1f5f9; margin-top: 0;">Hello, ${patientName}!</h2>
                        <p style="color: #94a3b8; line-height: 1.6;">
                            You have been successfully registered in our patient follow-up system. 
                            Use the credentials below to log in to your patient portal and view your 
                            medical reports, appointments, and more.
                        </p>
                        
                        <div style="background: #1e293b; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #334155;">
                            <h3 style="margin: 0 0 16px; color: #f1f5f9; font-size: 16px;">🔐 Your Login Credentials</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Patient ID</td>
                                    <td style="padding: 8px 0; color: #3b82f6; font-weight: bold; font-size: 18px; font-family: 'Courier New', monospace; letter-spacing: 1px;">${patientId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Password</td>
                                    <td style="padding: 8px 0; color: #3b82f6; font-weight: bold; font-size: 18px; font-family: 'Courier New', monospace; letter-spacing: 1px;">${plainPassword}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            <strong style="color: #f59e0b;">⚠️ Important:</strong> Keep these credentials safe and do not share them with anyone. 
                            If you lose your credentials, please contact the hospital reception.
                        </p>
                        
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="http://localhost:5173" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                Login to Patient Portal →
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #1e293b; padding: 20px 32px; text-align: center; border-top: 1px solid #334155;">
                        <p style="color: #64748b; font-size: 12px; margin: 0;">
                            This is an automated message from ${hospitalName}. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Admission email sent to ${patientEmail}`);
        return { sent: true };
    } catch (error) {
        console.error('📧 Email sending failed:', error.message);
        return { sent: false, reason: error.message };
    }
};

module.exports = { sendAdmissionEmail };
