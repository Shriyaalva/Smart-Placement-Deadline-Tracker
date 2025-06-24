import * as cron from 'node-cron';
import { storage } from '../storage';
import { notificationService } from './notification';

export class ReminderSchedulerService {
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check for pending reminders every minute
    cron.schedule('* * * * *', async () => {
      await this.processPendingReminders();
    });

    console.log('Reminder scheduler started');
  }

  stop() {
    this.isRunning = false;
    console.log('Reminder scheduler stopped');
  }

  async scheduleReminder(userId: number, opportunityId: number, reminderTime: Date, reminderType: string) {
    try {
      const reminder = await storage.createReminder({
        userId,
        opportunityId,
        reminderTime,
        reminderType
      });

      await storage.updateReminder(reminder.id, { isScheduled: true });
      console.log(`Reminder scheduled for ${reminderTime}`);
      
      return reminder;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  async scheduleRemindersForOpportunity(userId: number, opportunityId: number, deadline: Date) {
    try {
      const userSettings = await storage.getUserSettings(userId);
      const reminderDays = userSettings?.defaultReminderDays || 3;
      
      const reminderTime = new Date(deadline);
      reminderTime.setDate(reminderTime.getDate() - reminderDays);
      
      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        const reminderTypes = [];
        
        if (userSettings?.emailNotifications) {
          reminderTypes.push('email');
        }
        
        if (userSettings?.browserNotifications) {
          reminderTypes.push('browser');
        }
        
        if (reminderTypes.length === 0) {
          reminderTypes.push('email'); // Default to email
        }
        
        for (const type of reminderTypes) {
          await this.scheduleReminder(userId, opportunityId, reminderTime, type);
        }
      }
      
      // Also schedule urgent reminder if deadline is very close
      const urgentReminderTime = new Date(deadline);
      urgentReminderTime.setHours(urgentReminderTime.getHours() - 24); // 24 hours before
      
      if (urgentReminderTime > new Date()) {
        await this.scheduleReminder(userId, opportunityId, urgentReminderTime, 'email');
      }
      
    } catch (error) {
      console.error('Error scheduling reminders for opportunity:', error);
      throw error;
    }
  }

  private async processPendingReminders() {
    try {
      const pendingReminders = await storage.getPendingReminders();
      
      for (const reminder of pendingReminders) {
        await this.sendReminder(reminder);
      }
    } catch (error) {
      console.error('Error processing pending reminders:', error);
    }
  }

  private async sendReminder(reminder: any) {
    try {
      const opportunity = await storage.getPlacementOpportunity(reminder.opportunityId);
      const user = await storage.getUser(reminder.userId);
      
      if (!opportunity || !user) {
        console.error('Opportunity or user not found for reminder:', reminder.id);
        return;
      }

      if (reminder.reminderType === 'email') {
        await notificationService.sendReminderEmail(user, opportunity);
      }

      // Mark reminder as sent
      await storage.updateReminder(reminder.id, {
        isSent: true,
        sentAt: new Date()
      });

      console.log(`Reminder sent for opportunity: ${opportunity.title}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }
}

export const reminderSchedulerService = new ReminderSchedulerService();
