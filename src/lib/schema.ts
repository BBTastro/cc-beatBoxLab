import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// Authentication tables (keep existing)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// StepBox application tables
export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // days
  status: text("status"), // active, completed, paused, archived
  isDefault: boolean("isDefault").default(false),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  templateId: text("templateId"), // reference to template used
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const beats = pgTable("beats", {
  id: text("id").primaryKey(),
  challengeId: text("challengeId")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(), // the day this beat represents
  dayNumber: integer("dayNumber").notNull(), // 1-based day number in challenge
  isCompleted: boolean("isCompleted").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const beatDetails = pgTable("beatDetails", {
  id: text("id").primaryKey(),
  beatId: text("beatId")
    .notNull()
    .references(() => beats.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: text("category"), // optional category tag
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: text("id").primaryKey(),
  challengeId: text("challengeId")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planned"), // planned, active, achieved
  proofUrl: text("proofUrl"), // optional evidence link
  achievedAt: timestamp("achievedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const motivationalStatements = pgTable("motivationalStatements", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  challengeId: text("challengeId")
    .references(() => challenges.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  statement: text("statement").notNull(),
  why: text("why"), // reasoning behind the statement
  collaboration: text("collaboration"), // collaboration needs
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const allies = pgTable("allies", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role"), // optional role description
  phone: text("phone"), // optional SMS contact
  slackHandle: text("slackHandle"), // optional Slack contact
  discordUsername: text("discordUsername"), // optional Discord contact
  notificationPreferences: jsonb("notificationPreferences").default({}), // notification settings
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const moveConcepts = pgTable("moveConcepts", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // strategy, flow, create, build, strength, restore
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // main concept content
  aiBoostContent: text("aiBoostContent"), // AI boost section content
  tags: jsonb("tags").default([]), // array of tags
  isCustom: boolean("isCustom").default(false), // user-customized vs default
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const challengeTemplates = pgTable("challengeTemplates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // default duration in days
  category: text("category"), // template category
  motivationalStatement: jsonb("motivationalStatement"), // default statement structure
  defaultRewards: jsonb("defaultRewards").default([]), // array of default rewards
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
