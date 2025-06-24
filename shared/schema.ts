import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  gmailAccessToken: text("gmail_access_token"),
  gmailRefreshToken: text("gmail_refresh_token"),
  gmailTokenExpiry: timestamp("gmail_token_expiry"),
  isGmailConnected: boolean("is_gmail_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const placementOpportunities = pgTable("placement_opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  emailSubject: text("email_subject").notNull(),
  emailFrom: text("email_from").notNull(),
  emailBody: text("email_body").notNull(),
  deadline: timestamp("deadline"),
  extractedDeadlineText: text("extracted_deadline_text"),
  applicationUrl: text("application_url"),
  status: text("status").default("pending"), // pending, applied, expired
  isUrgent: boolean("is_urgent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  opportunityId: integer("opportunity_id").references(() => placementOpportunities.id).notNull(),
  reminderTime: timestamp("reminder_time").notNull(),
  reminderType: text("reminder_type").notNull(), // email, browser
  isScheduled: boolean("is_scheduled").default(false),
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  defaultReminderDays: integer("default_reminder_days").default(3),
  emailNotifications: boolean("email_notifications").default(true),
  browserNotifications: boolean("browser_notifications").default(false),
  lastEmailSync: timestamp("last_email_sync"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailProcessingLog = pgTable("email_processing_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emailId: text("email_id").notNull(),
  emailSubject: text("email_subject").notNull(),
  emailFrom: text("email_from").notNull(),
  isPlacementRelated: boolean("is_placement_related").default(false),
  processingStatus: text("processing_status").default("processed"), // processed, error
  errorMessage: text("error_message"),
  processedAt: timestamp("processed_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPlacementOpportunitySchema = createInsertSchema(placementOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
});

export const insertEmailProcessingLogSchema = createInsertSchema(emailProcessingLog).omit({
  id: true,
  processedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlacementOpportunity = z.infer<typeof insertPlacementOpportunitySchema>;
export type PlacementOpportunity = typeof placementOpportunities.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertEmailProcessingLog = z.infer<typeof insertEmailProcessingLogSchema>;
export type EmailProcessingLog = typeof emailProcessingLog.$inferSelect;
