/**
 * Email Service Module
 * Handles all email notifications using SendGrid
 * Includes order confirmations, invoices, payment receipts, and notifications
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  amount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  division: string;
  invoiceUrl?: string;
}

interface PaymentReceiptData {
  transactionId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  date: string;
  invoiceUrl?: string;
}

interface MembershipActivationData {
  customerName: string;
  customerEmail: string;
  membershipTier: string;
  division: string;
  startDate: string;
  endDate: string;
  benefits: string[];
  accessUrl: string;
}

interface NewsletterWelcomeData {
  subscriberEmail: string;
  subscriberName?: string;
  unsubscribeUrl: string;
}

/**
 * Generate Order Confirmation Email
 */
export function generateOrderConfirmationEmail(data: OrderConfirmationData): EmailTemplate {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .button { display: inline-block; background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .highlight { color: #00d4ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your purchase!</p>
        </div>
        <div class="content">
          <p>Dear <strong>${data.customerName}</strong>,</p>
          
          <p>We're excited to confirm your order from <span class="highlight">${data.division}</span>. Your order has been received and is being processed.</p>
          
          <h3>Order Details</h3>
          <table>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td style="padding: 10px;">Item</td>
              <td style="padding: 10px; text-align: center;">Quantity</td>
              <td style="padding: 10px; text-align: right;">Price</td>
            </tr>
            ${itemsHtml}
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="2" style="padding: 10px; text-align: right;">Total Amount:</td>
              <td style="padding: 10px; text-align: right; color: #00d4ff;">₹${data.amount.toLocaleString()}</td>
            </tr>
          </table>
          
          <p>
            <strong>Order Number:</strong> ${data.orderNumber}<br>
            <strong>Order Date:</strong> ${data.orderDate}<br>
            <strong>Division:</strong> ${data.division}
          </p>
          
          ${data.invoiceUrl ? `<p><a href="${data.invoiceUrl}" class="button">Download Invoice</a></p>` : ""}
          
          <p>You will receive a shipping confirmation email shortly with tracking information.</p>
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br><strong>AANS Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 AANS - Your Digital Brain. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Order Confirmation

Dear ${data.customerName},

Thank you for your purchase from ${data.division}!

Order Details:
${data.items.map((item) => `${item.name} x${item.quantity} - ₹${item.price.toLocaleString()}`).join("\n")}

Total Amount: ₹${data.amount.toLocaleString()}

Order Number: ${data.orderNumber}
Order Date: ${data.orderDate}

You will receive a shipping confirmation email shortly.

Best regards,
AANS Team
  `;

  return {
    subject: `Order Confirmation - ${data.orderNumber}`,
    html,
    text,
  };
}

/**
 * Generate Payment Receipt Email
 */
export function generatePaymentReceiptEmail(data: PaymentReceiptData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .receipt-box { background: white; padding: 20px; border: 2px solid #00d4ff; border-radius: 8px; margin: 20px 0; }
        .highlight { color: #00d4ff; font-weight: bold; }
        .success { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Your payment has been successfully processed</p>
        </div>
        <div class="content">
          <p>Dear <strong>${data.customerName}</strong>,</p>
          
          <p>Thank you for your payment. Your transaction has been completed successfully.</p>
          
          <div class="receipt-box">
            <h3 style="margin-top: 0; color: #00d4ff;">Receipt Details</h3>
            <p>
              <strong>Transaction ID:</strong> <span class="highlight">${data.transactionId}</span><br>
              <strong>Amount:</strong> <span class="highlight">₹${data.amount.toLocaleString()}</span><br>
              <strong>Payment Method:</strong> ${data.paymentMethod}<br>
              <strong>Date:</strong> ${data.date}<br>
              <strong>Status:</strong> <span class="success">✓ Completed</span>
            </p>
          </div>
          
          ${data.invoiceUrl ? `<p><a href="${data.invoiceUrl}" style="display: inline-block; background: #00d4ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Download Invoice</a></p>` : ""}
          
          <p>This receipt has been sent to your email for your records. Please keep it for your reference.</p>
          
          <p>If you have any questions or concerns about this transaction, please contact our support team immediately.</p>
          
          <p>Best regards,<br><strong>AANS Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 AANS - Your Digital Brain. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Receipt

Dear ${data.customerName},

Your payment has been successfully processed.

Receipt Details:
Transaction ID: ${data.transactionId}
Amount: ₹${data.amount.toLocaleString()}
Payment Method: ${data.paymentMethod}
Date: ${data.date}
Status: Completed

Please keep this receipt for your records.

Best regards,
AANS Team
  `;

  return {
    subject: `Payment Receipt - ${data.transactionId}`,
    html,
    text,
  };
}

/**
 * Generate Membership Activation Email
 */
export function generateMembershipActivationEmail(data: MembershipActivationData): EmailTemplate {
  const benefitsHtml = data.benefits.map((benefit) => `<li>${benefit}</li>`).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .membership-box { background: white; padding: 20px; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0; }
        .highlight { color: #00d4ff; font-weight: bold; }
        .success { color: #10b981; font-weight: bold; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${data.division}!</h1>
          <p>Your membership is now active</p>
        </div>
        <div class="content">
          <p>Dear <strong>${data.customerName}</strong>,</p>
          
          <p>Congratulations! Your <span class="highlight">${data.membershipTier}</span> membership to <span class="highlight">${data.division}</span> is now active.</p>
          
          <div class="membership-box">
            <h3 style="margin-top: 0; color: #10b981;">✓ Membership Activated</h3>
            <p>
              <strong>Tier:</strong> ${data.membershipTier}<br>
              <strong>Division:</strong> ${data.division}<br>
              <strong>Start Date:</strong> ${data.startDate}<br>
              <strong>End Date:</strong> ${data.endDate}
            </p>
            
            <h4>Your Benefits:</h4>
            <ul>
              ${benefitsHtml}
            </ul>
          </div>
          
          <p><a href="${data.accessUrl}" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Access Your Membership</a></p>
          
          <p>You can now enjoy all the benefits of your membership. Visit your dashboard to explore exclusive features and offers.</p>
          
          <p>If you have any questions, our support team is here to help!</p>
          
          <p>Best regards,<br><strong>AANS Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 AANS - Your Digital Brain. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to ${data.division}!

Dear ${data.customerName},

Congratulations! Your ${data.membershipTier} membership is now active.

Membership Details:
Tier: ${data.membershipTier}
Division: ${data.division}
Start Date: ${data.startDate}
End Date: ${data.endDate}

Your Benefits:
${data.benefits.map((b) => `- ${b}`).join("\n")}

Visit your dashboard to access exclusive features and offers.

Best regards,
AANS Team
  `;

  return {
    subject: `Welcome to ${data.division} - ${data.membershipTier} Membership Activated`,
    html,
    text,
  };
}

/**
 * Generate Newsletter Welcome Email
 */
export function generateNewsletterWelcomeEmail(data: NewsletterWelcomeData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .highlight { color: #00d4ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AANS Newsletter!</h1>
          <p>Stay updated with the latest news and insights</p>
        </div>
        <div class="content">
          <p>Dear ${data.subscriberName || "Subscriber"},</p>
          
          <p>Thank you for subscribing to the <span class="highlight">AANS Newsletter</span>! We're excited to have you on board.</p>
          
          <p>You'll now receive:</p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li>Exclusive updates about AVE, Sakshi, and SubCircle</li>
            <li>Industry insights and thought leadership articles</li>
            <li>Special offers and promotions for subscribers</li>
            <li>Tips and best practices for conscious living and business</li>
          </ul>
          
          <p>Keep an eye on your inbox for our next newsletter coming soon!</p>
          
          <p>If you have any suggestions or feedback, we'd love to hear from you.</p>
          
          <p>Best regards,<br><strong>AANS Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 AANS - Your Digital Brain. All rights reserved.</p>
          <p><a href="${data.unsubscribeUrl}" style="color: #6b7280; text-decoration: none;">Unsubscribe from this newsletter</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to AANS Newsletter!

Dear ${data.subscriberName || "Subscriber"},

Thank you for subscribing to the AANS Newsletter!

You'll now receive:
- Exclusive updates about AVE, Sakshi, and SubCircle
- Industry insights and thought leadership articles
- Special offers and promotions for subscribers
- Tips and best practices for conscious living and business

Keep an eye on your inbox for our next newsletter!

Best regards,
AANS Team

Unsubscribe: ${data.unsubscribeUrl}
  `;

  return {
    subject: "Welcome to AANS Newsletter",
    html,
    text,
  };
}

/**
 * Send email via SendGrid (placeholder for actual SendGrid integration)
 * In production, this would use @sendgrid/mail package
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  options?: {
    from?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }
) {
  const from = options?.from || "noreply@aans.com";

  try {
    // TODO: Implement actual SendGrid API call
    // const sgMail = require("@sendgrid/mail");
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to,
    //   from,
    //   subject: template.subject,
    //   html: template.html,
    //   text: template.text,
    //   replyTo: options?.replyTo,
    //   cc: options?.cc,
    //   bcc: options?.bcc,
    // });

    console.log(`Email sent to ${to}: ${template.subject}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  const template = generateOrderConfirmationEmail(data);
  return sendEmail(data.customerEmail, template);
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(data: PaymentReceiptData) {
  const template = generatePaymentReceiptEmail(data);
  return sendEmail(data.customerEmail, template);
}

/**
 * Send membership activation email
 */
export async function sendMembershipActivationEmail(data: MembershipActivationData) {
  const template = generateMembershipActivationEmail(data);
  return sendEmail(data.customerEmail, template);
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcomeEmail(data: NewsletterWelcomeData) {
  const template = generateNewsletterWelcomeEmail(data);
  return sendEmail(data.subscriberEmail, template);
}
