import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gmailService } from "./services/gmail";
import { emailParserService } from "./services/email-parser";
import { reminderSchedulerService } from "./services/reminder-scheduler";
import { notificationService } from "./services/notification";
import { insertUserSchema, insertUserSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the reminder scheduler
  reminderSchedulerService.start();

  // Auth routes
  app.get("/api/auth/google", async (req, res) => {
    try {
      const authUrl = gmailService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  app.post("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Authorization code required" });
      }

      const tokens = await gmailService.getTokens(code);
      const userInfo = await gmailService.getUserInfo(tokens.access_token!);

      // Create or update user
      let user = await storage.getUserByEmail(userInfo.email!);
      
      if (!user) {
        user = await storage.createUser({
          email: userInfo.email!,
          name: userInfo.name || userInfo.email!,
        });
        
        // Create default settings for new user
        await storage.createUserSettings({
          userId: user.id,
          defaultReminderDays: 3,
          emailNotifications: true,
          browserNotifications: false,
        });
      }

      // Update user with Gmail tokens
      await storage.updateUser(user.id, {
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token,
        gmailTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isGmailConnected: true,
      });

      // Send welcome email
      await notificationService.sendWelcomeEmail(user);

      res.json({ user, tokens });
    } catch (error) {
      console.error("Auth callback error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Email sync route
  app.post("/api/sync-emails", async (req, res) => {
    try {
      const { userId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user || !user.gmailAccessToken) {
        return res.status(400).json({ error: "User not found or Gmail not connected" });
      }

      // Fetch recent emails
      const emails = await gmailService.getEmails(
        user.gmailAccessToken,
        user.gmailRefreshToken!,
        "is:unread", // Only fetch unread emails
        20
      );

      let processedCount = 0;
      let placementEmailsCount = 0;

      for (const email of emails) {
        // Check if email is placement-related
        const isPlacementRelated = emailParserService.isPlacementRelated(
          email.subject,
          email.from,
          email.body
        );

        // Log the email processing
        await storage.createEmailProcessingLog({
          userId: user.id,
          emailId: email.id,
          emailSubject: email.subject,
          emailFrom: email.from,
          isPlacementRelated,
          processingStatus: "processed",
        });

        processedCount++;

        if (isPlacementRelated) {
          placementEmailsCount++;
          
          // Extract deadline and other info
          const { deadline, extractedText } = emailParserService.extractDeadline(
            email.subject,
            email.body
          );
          
          const company = emailParserService.extractCompanyName(
            email.from,
            email.subject,
            email.body
          );
          
          const applicationUrl = emailParserService.extractApplicationUrl(email.body);

          // Create placement opportunity
          const opportunity = await storage.createPlacementOpportunity({
            userId: user.id,
            title: email.subject,
            company,
            emailSubject: email.subject,
            emailFrom: email.from,
            emailBody: email.body,
            deadline,
            extractedDeadlineText: extractedText,
            applicationUrl,
          });

          // Schedule reminders if deadline exists
          if (deadline) {
            await reminderSchedulerService.scheduleRemindersForOpportunity(
              user.id,
              opportunity.id,
              deadline
            );
          }
        }
      }

      // Update last sync time
      await storage.updateUserSettings(user.id, {
        lastEmailSync: new Date(),
      });

      res.json({
        processedCount,
        placementEmailsCount,
        message: `Processed ${processedCount} emails, found ${placementEmailsCount} placement-related emails`,
      });
    } catch (error) {
      console.error("Email sync error:", error);
      res.status(500).json({ error: "Failed to sync emails" });
    }
  });

  // Placement opportunities routes
  app.get("/api/opportunities/:userId", async (req, res) => {
    try {
      const opportunities = await storage.getPlacementOpportunities(
        parseInt(req.params.userId)
      );
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/upcoming-deadlines/:userId", async (req, res) => {
    try {
      const deadlines = await storage.getUpcomingDeadlines(
        parseInt(req.params.userId)
      );
      res.json(deadlines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming deadlines" });
    }
  });

  app.patch("/api/opportunities/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const opportunity = await storage.updatePlacementOpportunity(
        parseInt(req.params.id),
        { status }
      );
      
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  // Settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(parseInt(req.params.userId));
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.updateUserSettings(
        parseInt(req.params.userId),
        req.body
      );
      
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Stats route
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getStats(parseInt(req.params.userId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Reminder routes
  app.get("/api/reminders/:userId", async (req, res) => {
    try {
      const reminders = await storage.getReminders(parseInt(req.params.userId));
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
