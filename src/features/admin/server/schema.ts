import { pgTable, text, varchar, timestamp, integer, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Communications table - for contact form submissions
 */
export const communications = pgTable('communications', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'), // 'new', 'done', 'dismissed'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Dashboard activity logs table
 */
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  action: varchar('action', { length: 100 }).notNull(),
  actor: varchar('actor', { length: 255 }).notNull(),
  meta: json('meta'), // Additional metadata as JSON
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Weekly metrics table - for dashboard charts and API hit counters
 */
export const weeklyMetrics = pgTable('weekly_metrics', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  date: varchar('date', { length: 50 }).notNull(), // e.g., "2026-04-25"
  queries: integer('queries').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
