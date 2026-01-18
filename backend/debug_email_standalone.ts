import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('--- Email Debug Script ---');
console.log('Loading .env from:', path.join(__dirname, '.env'));
const emailUser = process.env.MAIL_USER ?? process.env.EMAIL_USER;
const emailPass = process.env.MAIL_PASSWORD ?? process.env.EMAIL_PASS;

console.log('MAIL_USER/EMAIL_USER present:', !!emailUser);
console.log('MAIL_PASSWORD/EMAIL_PASSWORD present:', !!emailPass);

if (!emailUser || !emailPass) {
    console.error('ERROR: Credentials missing in environment variables.');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const sendTestEmail = async () => {
    try {
        console.log(`Attempting to send email from ${emailUser}...`);
        const info = await transporter.sendMail({
            from: `"Debug Bot" <${emailUser}>`,
            to: emailUser, // Send to self
            subject: 'Debug Email Test',
            text: 'If you receive this, the email configuration is working.',
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

void sendTestEmail();
