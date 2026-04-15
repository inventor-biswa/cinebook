const nodemailer = require('nodemailer');

// ─── MAILER TRANSPORT ─────────────────────────────────────────────────────────
// Uses Gmail SMTP with an App Password (not your regular Gmail password).
// Set EMAIL_USER and EMAIL_PASS in your .env file.
//   EMAIL_USER=youremail@gmail.com
//   EMAIL_PASS=xxxx xxxx xxxx xxxx   ← Gmail App Password

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS on port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send a generic email.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
async function sendMail(to, subject, html) {
    await transporter.sendMail({
        from: `"QwikShow" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

module.exports = { sendMail };
