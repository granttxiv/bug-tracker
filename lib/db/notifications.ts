import { db } from "./client";
import {
  notifications,
  notificationPreferences,
  NewNotification,
  NewNotificationPreference,
} from "./schema";
import { eq, desc } from "drizzle-orm";

// Notifications
export async function createNotification(data: NewNotification) {
  const [notif] = await db.insert(notifications).values(data).returning();
  return notif;
}

export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markAsRead(notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
    .returning();
  return updated || null;
}

// Preferences
export async function getPreferences(userId: string) {
  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
  return prefs || null;
}

export async function createPreferences(userId: string) {
  const [prefs] = await db.insert(notificationPreferences).values({ userId }).returning();
  return prefs;
}

export async function updatePreferences(userId: string, data: Partial<NewNotificationPreference>) {
  const [updated] = await db
    .update(notificationPreferences)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notificationPreferences.userId, userId))
    .returning();
  return updated || null;
}
