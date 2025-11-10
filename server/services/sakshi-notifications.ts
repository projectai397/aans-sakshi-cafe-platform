import { Reservation } from "./sakshi-reservations";

export interface NotificationTemplate {
  type: "confirmation" | "reminder" | "cancellation" | "feedback";
  subject: string;
  smsTemplate: string;
  emailTemplate: string;
}

export class NotificationService {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize notification templates
   */
  private initializeTemplates(): void {
    // Confirmation template
    this.templates.set("confirmation", {
      type: "confirmation",
      subject: "Your Sakshi Cafe Reservation Confirmed ✨",
      smsTemplate: `Hi {{customerName}}, your reservation at Sakshi Cafe for {{partySize}} on {{date}} at {{time}} is confirmed! Table: {{table}}. See you soon! 🌿`,
      emailTemplate: `
        <h2>Reservation Confirmed!</h2>
        <p>Hi {{customerName}},</p>
        <p>Your reservation at Sakshi Cafe has been confirmed with the following details:</p>
        <ul>
          <li><strong>Date:</strong> {{date}}</li>
          <li><strong>Time:</strong> {{time}}</li>
          <li><strong>Party Size:</strong> {{partySize}} guests</li>
          <li><strong>Special Requests:</strong> {{specialRequests}}</li>
        </ul>
        <p>We're excited to welcome you! If you need to make any changes, please call us at {{cafePhone}}.</p>
        <p>Warm regards,<br>Sakshi Cafe Team 🌿</p>
      `,
    });

    // Reminder template
    this.templates.set("reminder", {
      type: "reminder",
      subject: "Reminder: Your Sakshi Cafe Reservation Tomorrow",
      smsTemplate: `Hi {{customerName}}, reminder: your table at Sakshi Cafe is reserved for {{partySize}} tomorrow at {{time}}. We look forward to seeing you! 🌿`,
      emailTemplate: `
        <h2>Reservation Reminder</h2>
        <p>Hi {{customerName}},</p>
        <p>This is a friendly reminder about your upcoming reservation at Sakshi Cafe:</p>
        <ul>
          <li><strong>Tomorrow at:</strong> {{time}}</li>
          <li><strong>Party Size:</strong> {{partySize}} guests</li>
          <li><strong>Location:</strong> {{cafeLocation}}</li>
        </ul>
        <p>If you need to cancel or modify your reservation, please let us know as soon as possible.</p>
        <p>See you soon!<br>Sakshi Cafe Team 🌿</p>
      `,
    });

    // Cancellation template
    this.templates.set("cancellation", {
      type: "cancellation",
      subject: "Your Sakshi Cafe Reservation Cancelled",
      smsTemplate: `Hi {{customerName}}, your Sakshi Cafe reservation for {{date}} at {{time}} has been cancelled. Please contact us if this was a mistake.`,
      emailTemplate: `
        <h2>Reservation Cancelled</h2>
        <p>Hi {{customerName}},</p>
        <p>Your reservation at Sakshi Cafe for {{date}} at {{time}} has been cancelled.</p>
        <p>If you'd like to rebook, please visit our website or call us at {{cafePhone}}.</p>
        <p>Best regards,<br>Sakshi Cafe Team 🌿</p>
      `,
    });

    // Feedback template
    this.templates.set("feedback", {
      type: "feedback",
      subject: "How was your experience at Sakshi Cafe?",
      smsTemplate: `Hi {{customerName}}, thank you for visiting Sakshi Cafe! We'd love your feedback. Reply with your thoughts or visit: {{feedbackLink}}`,
      emailTemplate: `
        <h2>Share Your Experience</h2>
        <p>Hi {{customerName}},</p>
        <p>Thank you for dining with us at Sakshi Cafe! We'd love to hear about your experience.</p>
        <p><a href="{{feedbackLink}}">Click here to share your feedback</a></p>
        <p>Your feedback helps us serve you better and maintain our commitment to conscious dining.</p>
        <p>Warm regards,<br>Sakshi Cafe Team 🌿</p>
      `,
    });
  }

  /**
   * Get template by type
   */
  getTemplate(type: string): NotificationTemplate | undefined {
    return this.templates.get(type);
  }

  /**
   * Replace template variables with actual values
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value);
    });
    return result;
  }

  /**
   * Send confirmation SMS
   */
  async sendConfirmationSMS(
    reservation: Reservation,
    cafePhone: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getTemplate("confirmation");
      if (!template) {
        return { success: false, error: "Template not found" };
      }

      const variables = {
        customerName: reservation.customerName,
        partySize: reservation.partySize.toString(),
        date: reservation.reservationTime.toLocaleDateString("en-IN"),
        time: reservation.reservationTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        table: reservation.tableAssigned || "TBD",
      };

      const smsContent = this.replaceVariables(template.smsTemplate, variables);

      // TODO: Integrate with Twilio or Razorpay SMS API
      console.log(
        `[SMS] To: ${reservation.customerPhone}, Content: ${smsContent}`
      );

      return {
        success: true,
        messageId: `sms_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send confirmation email
   */
  async sendConfirmationEmail(
    reservation: Reservation,
    cafePhone: string,
    cafeLocation: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getTemplate("confirmation");
      if (!template) {
        return { success: false, error: "Template not found" };
      }

      const variables = {
        customerName: reservation.customerName,
        partySize: reservation.partySize.toString(),
        date: reservation.reservationTime.toLocaleDateString("en-IN"),
        time: reservation.reservationTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        specialRequests: reservation.specialRequests || "None",
        cafePhone,
      };

      const emailContent = this.replaceVariables(
        template.emailTemplate,
        variables
      );

      // TODO: Integrate with SendGrid or AWS SES
      console.log(
        `[EMAIL] To: ${reservation.customerEmail}, Subject: ${template.subject}`
      );

      return {
        success: true,
        messageId: `email_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send reminder SMS
   */
  async sendReminderSMS(
    reservation: Reservation
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getTemplate("reminder");
      if (!template) {
        return { success: false, error: "Template not found" };
      }

      const variables = {
        customerName: reservation.customerName,
        partySize: reservation.partySize.toString(),
        date: reservation.reservationTime.toLocaleDateString("en-IN"),
        time: reservation.reservationTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      const smsContent = this.replaceVariables(template.smsTemplate, variables);

      // TODO: Integrate with Twilio or Razorpay SMS API
      console.log(
        `[SMS REMINDER] To: ${reservation.customerPhone}, Content: ${smsContent}`
      );

      return {
        success: true,
        messageId: `sms_reminder_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(
    reservation: Reservation,
    cafeLocation: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getTemplate("reminder");
      if (!template) {
        return { success: false, error: "Template not found" };
      }

      const variables = {
        customerName: reservation.customerName,
        partySize: reservation.partySize.toString(),
        time: reservation.reservationTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        cafeLocation,
      };

      const emailContent = this.replaceVariables(
        template.emailTemplate,
        variables
      );

      // TODO: Integrate with SendGrid or AWS SES
      console.log(
        `[EMAIL REMINDER] To: ${reservation.customerEmail}, Subject: ${template.subject}`
      );

      return {
        success: true,
        messageId: `email_reminder_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(
    reservation: Reservation,
    cafePhone: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.getTemplate("cancellation");
      if (!template) {
        return { success: false, error: "Template not found" };
      }

      const variables = {
        customerName: reservation.customerName,
        date: reservation.reservationTime.toLocaleDateString("en-IN"),
        time: reservation.reservationTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        cafePhone,
      };

      const smsContent = this.replaceVariables(template.smsTemplate, variables);
      const emailContent = this.replaceVariables(
        template.emailTemplate,
        variables
      );

      console.log(`[SMS CANCELLATION] To: ${reservation.customerPhone}`);
      console.log(`[EMAIL CANCELLATION] To: ${reservation.customerEmail}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send feedback request
   */
  async sendFeedbackRequest(
    reservation: Reservation,
    feedbackLink: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.getTemplate("feedback");
      if (!template) {
        return { success: false, error: "Template not found" };
      }

      const variables = {
        customerName: reservation.customerName,
        feedbackLink,
      };

      const smsContent = this.replaceVariables(template.smsTemplate, variables);
      const emailContent = this.replaceVariables(
        template.emailTemplate,
        variables
      );

      console.log(`[SMS FEEDBACK] To: ${reservation.customerPhone}`);
      console.log(`[EMAIL FEEDBACK] To: ${reservation.customerEmail}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const notificationService = new NotificationService();
