
// server/services/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      if (process.env.NODE_ENV === 'production') {
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('📧 Ethereal test account configured');
      }
    } catch (err) {
      console.error('❌ Failed to initialize email transporter:', err);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email transporter verified and ready');
      return true;
    } catch (err) {
      console.error('❌ Transporter verification failed:', err);
      return false;
    }
  }

  async loadEmailTemplate(templateName, variables = {}) {
    try {
      const filePath = path.join(__dirname, '../templates', `${templateName}.html`);
      let template = await fs.readFile(filePath, 'utf8');
      for (const [key, val] of Object.entries(variables)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), val);
      }
      return template;
    } catch (err) {
      console.error(`⚠️ Template "${templateName}" load failed:`, err.message);
      return null;
    }
  }

  async sendEmail({ to, subject, html, replyTo }) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Portfolio" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Email sent:', nodemailer.getTestMessageUrl(info));
      }
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('❌ Email sending failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  async sendContactEmail(contactData) {
    const { name, email, subject, message } = contactData;
    const html = await this.loadEmailTemplate('contact', {
      name, email, subject,
      message: message.replace(/\n/g, '<br>'),
      date: new Date().toLocaleDateString()
    }) || this.createBasicContactTemplate(contactData);

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `📬 Portfolio Contact: ${subject}`,
      html,
      replyTo: email
    });
  }

  async sendAutoReply(contactData) {
    const { name, email } = contactData;
    const html = await this.loadEmailTemplate('auto-reply', {
      name,
      currentYear: new Date().getFullYear()
    }) || this.createBasicAutoReplyTemplate(name);

    return this.sendEmail({
      to: email,
      subject: '🤖 Thanks for reaching out!',
      html
    });
  }

  async sendFeedbackNotification(feedbackData) {
    const { name, email = 'Anonymous', rating, comment, category = 'General' } = feedbackData;
    const html = await this.loadEmailTemplate('feedback-notification', {
      name, email, category,
      comment: comment.replace(/\n/g, '<br>'),
      rating,
      stars: '★'.repeat(rating) + '☆'.repeat(5 - rating),
      date: new Date().toLocaleDateString()
    }) || this.createBasicFeedbackTemplate(feedbackData);

    return this.sendEmail({
      to: process.env.FEEDBACK_EMAIL || process.env.EMAIL_USER,
      subject: `⭐ New Feedback (${rating}/5) - ${category}`,
      html
    });
  }

  // Fallback templates below...

  createBasicContactTemplate({ name, email, subject, message }) {
    return `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    `;
  }

  createBasicAutoReplyTemplate(name) {
    return `
      <h2>Hey ${name} 👋</h2>
      <p>Thanks for reaching out! I’ll get back to you within 1–2 business days.</p>
      <p>Until then, take care.</p>
    `;
  }

  createBasicFeedbackTemplate({ name, email, rating, comment, category }) {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    return `
      <h2>New Feedback Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email || 'Anonymous'}</p>
      <p><strong>Category:</strong> ${category || 'General'}</p>
      <p><strong>Rating:</strong> <span style="color:gold;">${stars}</span></p>
      <p><strong>Comment:</strong><br>${comment.replace(/\n/g, '<br>')}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    `;
  }
}

module.exports = new EmailService();
