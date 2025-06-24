import { gmailService } from './gmail';
import type { User, PlacementOpportunity } from '@shared/schema';

export class NotificationService {
  async sendReminderEmail(user: User, opportunity: PlacementOpportunity) {
    if (!user.gmailAccessToken || !user.gmailRefreshToken) {
      console.error('Gmail tokens not available for user:', user.email);
      return;
    }

    const isUrgent = opportunity.deadline && new Date(opportunity.deadline) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const subject = isUrgent 
      ? `🚨 URGENT: ${opportunity.title} deadline approaching!`
      : `⏰ Reminder: ${opportunity.title} application deadline`;

    const body = this.generateReminderEmailBody(user, opportunity, isUrgent);

    try {
      await gmailService.sendEmail(
        user.gmailAccessToken,
        user.gmailRefreshToken,
        user.email,
        subject,
        body
      );
      
      console.log(`Reminder email sent to ${user.email} for ${opportunity.title}`);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  private generateReminderEmailBody(user: User, opportunity: PlacementOpportunity, isUrgent: boolean): string {
    const urgencyText = isUrgent ? '🚨 URGENT REMINDER' : '⏰ Friendly Reminder';
    const deadlineText = opportunity.deadline 
      ? new Date(opportunity.deadline).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Not specified';

    return `
Hi ${user.name},

${urgencyText}

Don't forget to apply for the ${opportunity.title} position at ${opportunity.company}!

📅 Deadline: ${deadlineText}
📧 Original Email: ${opportunity.emailSubject}
🏢 Company: ${opportunity.company}

${opportunity.applicationUrl ? `🔗 Apply here: ${opportunity.applicationUrl}` : ''}

${isUrgent ? 
  '⚠️ This deadline is approaching soon! Make sure to submit your application as soon as possible.' :
  'We recommend applying soon to avoid missing this opportunity.'
}

Good luck with your application!

Best regards,
PlacementAlert Team

---
This is an automated reminder from PlacementAlert. 
You can adjust your reminder settings in the app dashboard.
    `.trim();
  }

  async sendWelcomeEmail(user: User) {
    if (!user.gmailAccessToken || !user.gmailRefreshToken) {
      console.error('Gmail tokens not available for user:', user.email);
      return;
    }

    const subject = 'Welcome to PlacementAlert! 🎓';
    const body = `
Hi ${user.name},

Welcome to PlacementAlert! 🎉

Your Gmail account has been successfully connected, and we're already scanning your emails for placement opportunities.

Here's what PlacementAlert will do for you:
✅ Automatically detect placement-related emails
✅ Extract application deadlines
✅ Send timely reminders before deadlines
✅ Help you stay organized with all your opportunities

Visit your dashboard to see all detected opportunities and customize your reminder settings.

Happy job hunting!

Best regards,
PlacementAlert Team
    `.trim();

    try {
      await gmailService.sendEmail(
        user.gmailAccessToken,
        user.gmailRefreshToken,
        user.email,
        subject,
        body
      );
      
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}

export const notificationService = new NotificationService();
