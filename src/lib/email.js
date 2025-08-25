import nodemailer from 'nodemailer';

// Configure the Nodemailer transporter using your environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // Use true for port 465, false for others like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // TLS CONFIGURATION BLOCK
  tls: {
    // This is often needed for local development or certain hosting environments
    rejectUnauthorized: false, 
  },
});

// Enhanced HTML email template with modern styling
const createInvoiceHtml = (invoice) => {
  const issuedDate = new Date(invoice.issuedAt).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contribution Receipt</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
          <div style="background-color: rgba(255, 255, 255, 0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
            <div style="color: white; font-size: 32px; font-weight: bold;">💰</div>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Payment Confirmed!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your contribution has been successfully processed</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Greeting -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Dear Valued Member,</h2>
            <p style="color: #5a6c7d; line-height: 1.6; margin: 0; font-size: 16px;">
              Thank you for your continued commitment to our Chama. Your contribution strengthens our community and helps us achieve our collective financial goals.
            </p>
          </div>
          
          <!-- Payment Details Card -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2);"></div>
            
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="background-color: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">✓</span>
              Payment Details
            </h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Invoice Number:</span>
                <span style="color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace; background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${invoice.invoiceNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Amount Paid:</span>
                <span style="color: #059669; font-weight: 700; font-size: 20px;">KES ${invoice.amount.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-weight: 500;">Payment Status:</span>
                <span style="background-color: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                  ● PAID
                </span>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="color: #64748b; font-weight: 500;">Date Processed:</span>
                <span style="color: #1e293b; font-weight: 600;">${issuedDate}</span>
              </div>
            </div>
          </div>
          
          <!-- Appreciation Message -->
          <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="color: #713f12; margin: 0; font-style: italic; line-height: 1.6;">
              "Together we achieve more. Your contribution is an investment in our shared prosperity and the foundation of our financial success."
            </p>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #5a6c7d; margin: 0 0 20px 0; line-height: 1.6;">
              Keep track of your contributions and explore more features in your member portal.
            </p>
            <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              View Member Dashboard
            </a>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Our Chama</h4>
            <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
              Building wealth together, one contribution at a time.<br>
              <strong>Email:</strong> support@ourchama.com | <strong>Phone:</strong> +254 700 000 000
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.4;">
              This is an automated message. Please do not reply to this email.<br>
              If you have any questions, contact our support team.
            </p>
            <p style="color: #cbd5e1; font-size: 11px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} Our Chama. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
      
      <!-- Mobile Responsiveness -->
      <style>
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 20px !important;
            border-radius: 8px !important;
          }
          .header-padding {
            padding: 30px 20px !important;
          }
          .content-padding {
            padding: 30px 20px !important;
          }
          .amount-text {
            font-size: 18px !important;
          }
        }
      </style>
      
    </body>
    </html>
  `;
};

/**
 * Sends a beautifully formatted invoice email to a user.
 * @param {object} options
 * @param {string} options.to - The recipient's email address.
 * @param {object} options.invoice - The invoice object from the database.
 */
export async function sendInvoiceEmail({ to, invoice }) {
  const subject = `✅ Payment Confirmed - Invoice ${invoice.invoiceNumber}`;
  const html = createInvoiceHtml(invoice);

  const mailOptions = {
    from: `"Our Chama Community" <${process.env.EMAIL_USER}>`, // Enhanced sender name
    to: to,
    subject: subject,
    html: html,
    // Add text fallback for email clients that don't support HTML
    text: `
Payment Confirmed!

Dear Valued Member,

Thank you for your contribution. Your payment has been successfully processed.

Payment Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount Paid: KES ${invoice.amount.toLocaleString()}
- Status: PAID
- Date Processed: ${new Date(invoice.issuedAt).toLocaleDateString('en-KE')}

Thank you for being a valued member of our Chama community.

Best regards,
Our Chama Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    // Return error info instead of throwing to allow graceful handling
    return { 
      success: false, 
      message: 'Email sending failed', 
      error: error.message 
    };
  }
}