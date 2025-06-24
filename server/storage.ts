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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private placementOpportunities: Map<number, PlacementOpportunity>;
  private reminders: Map<number, Reminder>;
  private userSettings: Map<number, UserSettings>;
  private emailProcessingLogs: Map<number, EmailProcessingLog>;
  private currentUserId: number;
  private currentOpportunityId: number;
  private currentReminderId: number;
  private currentSettingsId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.placementOpportunities = new Map();
    this.reminders = new Map();
    this.userSettings = new Map();
    this.emailProcessingLogs = new Map();
    this.currentUserId = 1;
    this.currentOpportunityId = 1;
    this.currentReminderId = 1;
    this.currentSettingsId = 1;
    this.currentLogId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      isGmailConnected: false,
      gmailAccessToken: null,
      gmailRefreshToken: null,
      gmailTokenExpiry: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getPlacementOpportunities(userId: number): Promise<PlacementOpportunity[]> {
    return Array.from(this.placementOpportunities.values()).filter(
      (opportunity) => opportunity.userId === userId
    );
  }

  async getPlacementOpportunity(id: number): Promise<PlacementOpportunity | undefined> {
    return this.placementOpportunities.get(id);
  }

  async createPlacementOpportunity(insertOpportunity: InsertPlacementOpportunity): Promise<PlacementOpportunity> {
    const id = this.currentOpportunityId++;
    const opportunity: PlacementOpportunity = {
      ...insertOpportunity,
      id,
      createdAt: new Date(),
      status: "pending",
      isUrgent: false,
      deadline: insertOpportunity.deadline || null,
      extractedDeadlineText: insertOpportunity.extractedDeadlineText || null,
      applicationUrl: insertOpportunity.applicationUrl || null
    };
    this.placementOpportunities.set(id, opportunity);
    return opportunity;
  }

  async updatePlacementOpportunity(id: number, updateOpportunity: Partial<PlacementOpportunity>): Promise<PlacementOpportunity | undefined> {
    const opportunity = this.placementOpportunities.get(id);
    if (!opportunity) return undefined;
    
    const updatedOpportunity = { ...opportunity, ...updateOpportunity };
    this.placementOpportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }

  async getUpcomingDeadlines(userId: number): Promise<PlacementOpportunity[]> {
    const opportunities = await this.getPlacementOpportunities(userId);
    return opportunities
      .filter(opp => opp.deadline && opp.status === "pending")
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }

  async getReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId
    );
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = {
      ...insertReminder,
      id,
      createdAt: new Date(),
      isScheduled: false,
      isSent: false,
      sentAt: null
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, updateReminder: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...updateReminder };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async getPendingReminders(): Promise<Reminder[]> {
    const now = new Date();
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.isScheduled && !reminder.isSent && new Date(reminder.reminderTime) <= now
    );
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = this.currentSettingsId++;
    const settings: UserSettings = {
      ...insertSettings,
      id,
      createdAt: new Date(),
      defaultReminderDays: insertSettings.defaultReminderDays || 3,
      emailNotifications: insertSettings.emailNotifications ?? true,
      browserNotifications: insertSettings.browserNotifications ?? false,
      lastEmailSync: insertSettings.lastEmailSync || null
    };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: number, updateSettings: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const settings = Array.from(this.userSettings.values()).find(s => s.userId === userId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...updateSettings };
    this.userSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }

  async createEmailProcessingLog(insertLog: InsertEmailProcessingLog): Promise<EmailProcessingLog> {
    const id = this.currentLogId++;
    const log: EmailProcessingLog = {
      ...insertLog,
      id,
      processedAt: new Date(),
      processingStatus: insertLog.processingStatus || "processed",
      errorMessage: insertLog.errorMessage || null
    };
    this.emailProcessingLogs.set(id, log);
    return log;
  }

  async getEmailProcessingLogs(userId: number): Promise<EmailProcessingLog[]> {
    return Array.from(this.emailProcessingLogs.values()).filter(
      (log) => log.userId === userId
    );
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

export const storage = new MemStorage();
