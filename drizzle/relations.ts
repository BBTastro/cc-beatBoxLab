import { relations } from "drizzle-orm/relations";
import { user, account, session, challenges, beats, moveConcepts, motivationalStatements, allies, beatDetails, rewards } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	beats: many(beats),
	challenges: many(challenges),
	moveConcepts: many(moveConcepts),
	motivationalStatements: many(motivationalStatements),
	allies: many(allies),
	beatDetails: many(beatDetails),
	rewards: many(rewards),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const beatsRelations = relations(beats, ({one, many}) => ({
	challenge: one(challenges, {
		fields: [beats.challengeId],
		references: [challenges.id]
	}),
	user: one(user, {
		fields: [beats.userId],
		references: [user.id]
	}),
	beatDetails: many(beatDetails),
}));

export const challengesRelations = relations(challenges, ({one, many}) => ({
	beats: many(beats),
	user: one(user, {
		fields: [challenges.userId],
		references: [user.id]
	}),
	motivationalStatements: many(motivationalStatements),
	rewards: many(rewards),
}));

export const moveConceptsRelations = relations(moveConcepts, ({one}) => ({
	user: one(user, {
		fields: [moveConcepts.userId],
		references: [user.id]
	}),
}));

export const motivationalStatementsRelations = relations(motivationalStatements, ({one}) => ({
	user: one(user, {
		fields: [motivationalStatements.userId],
		references: [user.id]
	}),
	challenge: one(challenges, {
		fields: [motivationalStatements.challengeId],
		references: [challenges.id]
	}),
}));

export const alliesRelations = relations(allies, ({one}) => ({
	user: one(user, {
		fields: [allies.userId],
		references: [user.id]
	}),
}));

export const beatDetailsRelations = relations(beatDetails, ({one}) => ({
	beat: one(beats, {
		fields: [beatDetails.beatId],
		references: [beats.id]
	}),
	user: one(user, {
		fields: [beatDetails.userId],
		references: [user.id]
	}),
}));

export const rewardsRelations = relations(rewards, ({one}) => ({
	challenge: one(challenges, {
		fields: [rewards.challengeId],
		references: [challenges.id]
	}),
	user: one(user, {
		fields: [rewards.userId],
		references: [user.id]
	}),
}));