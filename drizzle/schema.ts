import { pgTable, text, timestamp, unique, boolean, foreignKey, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const beats = pgTable("beats", {
	id: text().primaryKey().notNull(),
	challengeId: text().notNull(),
	userId: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	dayNumber: integer().notNull(),
	isCompleted: boolean().default(false),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.challengeId],
			foreignColumns: [challenges.id],
			name: "beats_challengeId_challenges_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "beats_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const challenges = pgTable("challenges", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	title: text().notNull(),
	description: text(),
	duration: integer().notNull(),
	status: text(),
	isDefault: boolean().default(false),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	templateId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "challenges_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const challengeTemplates = pgTable("challengeTemplates", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	duration: integer().notNull(),
	category: text(),
	motivationalStatement: jsonb(),
	defaultRewards: jsonb().default([]),
	isActive: boolean().default(true),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const moveConcepts = pgTable("moveConcepts", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	type: text().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	content: text().notNull(),
	aiBoostContent: text(),
	tags: jsonb().default([]),
	isCustom: boolean().default(false),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "moveConcepts_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const motivationalStatements = pgTable("motivationalStatements", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	title: text().notNull(),
	statement: text().notNull(),
	why: text(),
	collaboration: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	challengeId: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "motivationalStatements_userId_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.challengeId],
			foreignColumns: [challenges.id],
			name: "motivationalStatements_challengeId_challenges_id_fk"
		}).onDelete("cascade"),
]);

export const allies = pgTable("allies", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	role: text(),
	phone: text(),
	slackHandle: text(),
	discordUsername: text(),
	notificationPreferences: jsonb().default({}),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "allies_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const beatDetails = pgTable("beatDetails", {
	id: text().primaryKey().notNull(),
	beatId: text().notNull(),
	userId: text().notNull(),
	content: text().notNull(),
	category: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.beatId],
			foreignColumns: [beats.id],
			name: "beatDetails_beatId_beats_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "beatDetails_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const rewards = pgTable("rewards", {
	id: text().primaryKey().notNull(),
	challengeId: text().notNull(),
	userId: text().notNull(),
	title: text().notNull(),
	description: text(),
	status: text().default('planned').notNull(),
	proofUrl: text(),
	achievedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.challengeId],
			foreignColumns: [challenges.id],
			name: "rewards_challengeId_challenges_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "rewards_userId_user_id_fk"
		}).onDelete("cascade"),
]);
