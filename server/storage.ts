import { 
  users, 
  placementOpportunities, 
  reminders, 
  userSettings, 
  emailProcessingLog,
  type User, 
  type InsertUser,
  type PlacementOpportunity,
  type InsertPlacementOpportunity,
  type Reminder,
  type InsertReminder,
  type UserSettings,
  type InsertUserSettings,
  type EmailProcessingLog,
  type InsertEmailProcessingLog
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Placement opportunities
  getPlacementOpportunities(userId: number): Promise<PlacementOpportunity[]>;
  getPlacementOpportunity(id: number): Promise<PlacementOpportunity | undefined>;
  createPlacementOpportunity(opportunity: InsertPlacementOpportunity): Promise<PlacementOpportunity>;
  updatePlacementOpportunity(id: number, opportunity: Partial<PlacementOpportunity>): Promise<PlacementOpportunity | undefined>;
  getUpcomingDeadlines(userId: number): Promise<PlacementOpportunity[]>;
  
  // Reminders
  getReminders(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder | undefined>;
  getPendingReminders(): Promise<Reminder[]>;
  
  // User settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // Email processing log
  createEmailProcessingLog(log: InsertEmailProcessingLog): Promise<EmailProcessingLog>;
  getEmailProcessingLogs(userId: number): Promise<EmailProcessingLog[]>;
  
  // Analytics
  getStats(userId: number): Promise<{
    activeOpportunities: number;
    upcomingDeadlines: number;
    applicationsSent: number;
    emailsProcessed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getPlacementOpportunities(userId: number): Promise<PlacementOpportunity[]> {
    return await db.select().from(placementOpportunities).where(eq(placementOpportunities.userId, userId));
  }

  async getPlacementOpportunity(id: number): Promise<PlacementOpportunity | undefined> {
    const [opportunity] = await db.select().from(placementOpportunities).where(eq(placementOpportunities.id, id));
    return opportunity || undefined;
  }

  async createPlacementOpportunity(insertOpportunity: InsertPlacementOpportunity): Promise<PlacementOpportunity> {
    const [opportunity] = await db
      .insert(placementOpportunities)
      .values(insertOpportunity)
      .returning();
    return opportunity;
  }

  async updatePlacementOpportunity(id: number, updateOpportunity: Partial<PlacementOpportunity>): Promise<PlacementOpportunity | undefined> {
    const [opportunity] = await db
      .update(placementOpportunities)
      .set(updateOpportunity)
      .where(eq(placementOpportunities.id, id))
      .returning();
    return opportunity || undefined;
  }

  async getUpcomingDeadlines(userId: number): Promise<PlacementOpportunity[]> {
    const opportunities = await db
      .select()
      .from(placementOpportunities)
      .where(eq(placementOpportunities.userId, userId));
    
    return opportunities
      .filter(opp => opp.deadline && opp.status === "pending")
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }

  async getReminders(userId: number): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db
      .insert(reminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async updateReminder(id: number, updateReminder: Partial<Reminder>): Promise<Reminder | undefined> {
    const [reminder] = await db
      .update(reminders)
      .set(updateReminder)
      .where(eq(reminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async getPendingReminders(): Promise<Reminder[]> {
    const now = new Date();
    const allReminders = await db.select().from(reminders);
    return allReminders.filter(
      (reminder) => reminder.isScheduled && !reminder.isSent && new Date(reminder.reminderTime) <= now
    );
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateUserSettings(userId: number, updateSettings: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const [settings] = await db
      .update(userSettings)
      .set(updateSettings)
      .where(eq(userSettings.userId, userId))
      .returning();
    return settings || undefined;
  }

  async createEmailProcessingLog(insertLog: InsertEmailProcessingLog): Promise<EmailProcessingLog> {
    const [log] = await db
      .insert(emailProcessingLog)
      .values(insertLog)
      .returning();
    return log;
  }

  async getEmailProcessingLogs(userId: number): Promise<EmailProcessingLog[]> {
    return await db.select().from(emailProcessingLog).where(eq(emailProcessingLog.userId, userId));
  }

  async getStats(userId: number): Promise<{
    activeOpportunities: number;
    upcomingDeadlines: number;
    applicationsSent: number;
    emailsProcessed: number;
  }> {
    const opportunities = await this.getPlacementOpportunities(userId);
    const logs = await this.getEmailProcessingLogs(userId);
    
    return {
      activeOpportunities: opportunities.filter(opp => opp.status === "pending").length,
      upcomingDeadlines: opportunities.filter(opp => opp.deadline && opp.status === "pending").length,
      applicationsSent: opportunities.filter(opp => opp.status === "applied").length,
      emailsProcessed: logs.length
    };
  }
}

export const storage = new DatabaseStorage();
