import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });
};

// Types
interface EmailRequest {
  to: string[];
  subject: string;
  message: string;
  isHtml?: boolean;
}

interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email server is running' });
});

app.post('/api/send-bulk-email', async (req, res) => {
  try {
    const { to, subject, message, isHtml = false }: EmailRequest = req.body;

    // Validation
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipients list is required and must be a non-empty array' 
      });
    }

    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Subject and message are required' 
      });
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = to.filter(email => !emailRegex.test(email.trim()));
    
    if (invalidEmails.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid email addresses: ${invalidEmails.join(', ')}` 
      });
    }

    const transporter = createTransporter();
    const results: EmailResult[] = [];

    // Send emails one by one to track individual results
    for (const email of to) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email.trim(),
          subject: subject,
          [isHtml ? 'html' : 'text']: message,
        };

        await transporter.sendMail(mailOptions);
        results.push({ email, success: true });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.push({ 
          email, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk email sending completed. ${successCount} sent, ${failureCount} failed.`,
      results,
      summary: {
        total: to.length,
        sent: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Bulk email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error while sending emails' 
    });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send test email to self
      subject: 'Test Email - Bulk Email Sender',
      text: 'This is a test email to verify the email configuration is working correctly.',
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send test email' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Email user configured: ${process.env.EMAIL_USER}`);
});