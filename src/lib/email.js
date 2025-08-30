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
const createManualContributionHtml = ({ memberName, chamaName, amount, adminName }) => `
  <!DOCTYPE html>
  <html>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">Contribution Recorded</h2>
      <p>Hello ${memberName},</p>
      <p>This is a confirmation that a manual contribution has been recorded for you in the <strong>${chamaName}</strong> chama.</p>
      <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px;">
        <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
        <p><strong>Recorded By:</strong> ${adminName}</p>
        <p><strong>Payment Method:</strong> Cash</p>
      </div>
      <p>This transaction will now be reflected in your contribution history in the app.</p>
      <p>Thank you,<br/>The ChamaApp Team</p>
    </div>
  </body>
  </html>
`;
export async function sendManualContributionEmail({ to, memberName, chamaName, amount, adminName }) {
  const mailOptions = {
    from: `"ChamaApp Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject: `A contribution was recorded for you in ${chamaName}`,
    html: createManualContributionHtml({ memberName, chamaName, amount, adminName }),
  };
  await transporter.sendMail(mailOptions);
}
const createPayoutNotificationHtml = ({ memberName, chamaName, totalDistributed, shareAmount, cycleEndDate }) => `
  <!DOCTYPE html>
  <html>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #28a745;">Funds Distributed!</h2>
      <p>Hello ${memberName},</p>
      <p>Great news! The savings cycle for the <strong>${chamaName}</strong> chama has been completed and the funds have been distributed.</p>
      <div style="background-color: #e9f5ec; padding: 15px; border-radius: 5px;">
        <p><strong>Total Amount Distributed:</strong> KES ${totalDistributed.toLocaleString()}</p>
        <p><strong>Your Share:</strong> KES ${shareAmount.toLocaleString()}</p>
        <p><strong>Cycle End Date:</strong> ${new Date(cycleEndDate).toLocaleDateString()}</p>
      </div>
      <p>This payout is now recorded in your chama's history. A new savings cycle can now begin!</p>
      <p>Congratulations on achieving your savings goal,<br/>The ChamaApp Team</p>
    </div>
  </body>
  </html>
`;
export async function sendPayoutNotificationEmail({ to, memberName, chamaName, totalDistributed, shareAmount, cycleEndDate }) {
    const mailOptions = {
        from: `"ChamaApp Notifications" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Your Payout from ${chamaName} has been distributed!`,
        html: createPayoutNotificationHtml({ memberName, chamaName, totalDistributed, shareAmount, cycleEndDate }),
    };
    await transporter.sendMail(mailOptions);
}

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
export async function sendChamaApprovalEmail({ to, chamaName }) {
  const subject = `🎉 Congratulations! Your Chama "${chamaName}" has been approved`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chama Approved</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #393B65 0%, #2D2F4F 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
            🎉 Chama Approved!
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #e8f5e8; color: #2d5016; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              ✅ Application Approved
            </div>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear Valued Member,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We are <strong style="color: #393B65;">delighted</strong> to inform you that your application for the Chama 
            <strong style="color: #393B65; background-color: #f0f1ff; padding: 2px 8px; border-radius: 4px;">"${chamaName}"</strong> 
            has been successfully approved! 🎊
          </p>
          
          <!-- Feature Highlights -->
          <div style="background-color: #f8f9ff; border-left: 4px solid #393B65; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #393B65; margin: 0 0 15px 0; font-size: 18px;">What's next?</h3>
            <ul style="color: #555; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">🔐 <strong>Log in to your dashboard</strong> to start managing your Chama</li>
              <li style="margin-bottom: 8px;">👥 <strong>Invite members</strong> to join your growing community</li>
              <li style="margin-bottom: 8px;">💰 <strong>Set up contributions</strong> and financial goals</li>
              <li>📊 <strong>Track progress</strong> with detailed analytics</li>
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #393B65 0%, #2D2F4F 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(57, 59, 101, 0.3); transition: all 0.3s ease;">
              Access Your Dashboard →
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            Thank you for choosing our platform to manage your Chama. We're excited to be part of your financial journey!
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.5;">
            © 2025 Chama App. All rights reserved.<br>
            Need help? Contact us at support@chamaapp.com
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Chama App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent successfully to ${to} for Chama: ${chamaName}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(`❌ Failed to send approval email to ${to} for Chama: ${chamaName}`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}
export async function sendChamaRejectionEmail({ to, chamaName, rejectionReason }) {
  const subject = `Update on your Chama application for "${chamaName}"`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chama Application Update</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
            Chama Application Update
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #fff3cd; color: #856404; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #ffeaa7;">
              📋 Application Reviewed
            </div>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear Valued Applicant,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your interest in creating a Chama with us. We have carefully reviewed your application for 
            <strong style="color: #6c757d; background-color: #f8f9fa; padding: 2px 8px; border-radius: 4px;">"${chamaName}"</strong>.
          </p>
          
          <div style="background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #333; margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
              Unfortunately, we are unable to approve your application at this time.
            </p>
            ${rejectionReason ? `
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #f1c0c7;">
              <p style="margin: 0; color: #721c24; font-size: 14px; line-height: 1.5;">
                <strong>Reason:</strong> ${rejectionReason}
              </p>
            </div>
            ` : ''}
          </div>
          
          <!-- Next Steps -->
          <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">📧 <strong>Contact Support:</strong> Reach out if you have questions about this decision</li>
              <li style="margin-bottom: 8px;">🔄 <strong>Reapply:</strong> You're welcome to submit a new application in the future</li>
              <li style="margin-bottom: 8px;">📚 <strong>Learn More:</strong> Review our Chama guidelines for better preparation</li>
              <li>💬 <strong>Get Help:</strong> Our team is here to assist with any concerns</li>
            </ul>
          </div>
          
          <!-- Support CTA -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="mailto:support@chamaapp.com" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);">
              Contact Support Team
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            We appreciate your interest in our platform and encourage you to reach out if you have any questions or would like guidance for future applications.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 25px;">
            Best regards,<br>
            <strong style="color: #393B65;">The Chama App Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.5;">
            © 2025 Chama App. All rights reserved.<br>
            📧 support@chamaapp.com | 📞 +254-XXX-XXXX | 🌐 www.chamaapp.com
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Chama App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Rejection email sent successfully to ${to} for Chama: ${chamaName}`);
    return { success: true, message: 'Rejection email sent successfully' };
  } catch (error) {
    console.error(`❌ Failed to send rejection email to ${to} for Chama: ${chamaName}`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}
export async function sendChamaInvitationEmail({ to, inviterName, chamaName, invitationLink }) {
  const subject = `🎉 You've been invited to join ${chamaName}!`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chama Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
            🎉 You're Invited!
          </h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Join an exciting savings journey
          </p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #e8f5e8; color: #155724; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              💌 Personal Invitation
            </div>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello there! 👋
          </p>
          
          <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #dee2e6;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
              <strong style="color: #393B65; font-size: 18px;">${inviterName}</strong> has invited you to join their savings group
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; background: linear-gradient(135deg, #393B65 0%, #2D2F4F 100%); color: #ffffff; padding: 12px 25px; border-radius: 8px; font-weight: 700; font-size: 20px; letter-spacing: 1px;">
                "${chamaName}"
              </span>
            </div>
          </div>
          
          <!-- Benefits Section -->
          <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">Why join a Chama? 🤔</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">💰 <strong>Collective Savings:</strong> Pool resources for bigger financial goals</li>
              <li style="margin-bottom: 8px;">🤝 <strong>Community Support:</strong> Build lasting relationships with like-minded savers</li>
              <li style="margin-bottom: 8px;">📈 <strong>Financial Growth:</strong> Access to investment opportunities and loans</li>
              <li style="margin-bottom: 8px;">🎯 <strong>Goal Achievement:</strong> Stay motivated with group accountability</li>
              <li>🔒 <strong>Secure Platform:</strong> Transparent tracking and secure transactions</li>
            </ul>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 35px 0;">
            <div style="margin-bottom: 15px;">
              <a href="${invitationLink || '#'}" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); margin-right: 10px;">
                Accept Invitation ✨
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin: 15px 0;">
              Don't have an account yet? 
              <a href="#" style="color: #007bff; text-decoration: none; font-weight: 600;">
                Register for free →
              </a>
            </p>
          </div>
          
          <!-- Personal Touch -->
          <div style="background-color: #fff9e6; padding: 20px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 25px 0;">
            <p style="color: #333; margin: 0; font-size: 15px; line-height: 1.6; text-align: center; font-style: italic;">
              💭 "${inviterName} thought you'd be a great addition to their savings community. 
              Join them on this exciting financial journey!"
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            This invitation was sent to you because <strong>${inviterName}</strong> believes you'd be a valuable member of their Chama. 
            If you have any questions about joining or using our platform, our support team is ready to help!
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 25px;">
            Welcome to the community! 🌟<br>
            <strong style="color: #393B65;">The Chama App Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0 0 10px 0; line-height: 1.5;">
            © 2025 Chama App. Building stronger communities through savings.
          </p>
          <p style="color: #888; font-size: 11px; margin: 0; line-height: 1.4;">
            📧 support@chamaapp.com | 📞 +254-XXX-XXXX | 🌐 www.chamaapp.com<br>
            <a href="#" style="color: #007bff; text-decoration: none;">Privacy Policy</a> | 
            <a href="#" style="color: #007bff; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Chama App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`💌 Invitation email sent successfully to ${to} for Chama: ${chamaName} (invited by ${inviterName})`);
    return { success: true, message: 'Invitation email sent successfully' };
  } catch (error) {
    console.error(`❌ Failed to send invitation email to ${to} for Chama: ${chamaName}`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}