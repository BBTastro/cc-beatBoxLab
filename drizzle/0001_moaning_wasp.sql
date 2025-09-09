CREATE TABLE "allies" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"phone" text,
	"slackHandle" text,
	"discordUsername" text,
	"notificationPreferences" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beatDetails" (
	"id" text PRIMARY KEY NOT NULL,
	"beatId" text NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beats" (
	"id" text PRIMARY KEY NOT NULL,
	"challengeId" text NOT NULL,
	"userId" text NOT NULL,
	"date" timestamp NOT NULL,
	"dayNumber" integer NOT NULL,
	"isCompleted" boolean DEFAULT false,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challengeTemplates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"duration" integer NOT NULL,
	"category" text,
	"motivationalStatement" jsonb,
	"defaultRewards" jsonb DEFAULT '[]'::jsonb,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"status" text,
	"isDefault" boolean DEFAULT false,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"templateId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motivationalStatements" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"statement" text NOT NULL,
	"why" text,
	"collaboration" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moveConcepts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"aiBoostContent" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"isCustom" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"challengeId" text NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"proofUrl" text,
	"achievedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "allies" ADD CONSTRAINT "allies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beatDetails" ADD CONSTRAINT "beatDetails_beatId_beats_id_fk" FOREIGN KEY ("beatId") REFERENCES "public"."beats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beatDetails" ADD CONSTRAINT "beatDetails_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beats" ADD CONSTRAINT "beats_challengeId_challenges_id_fk" FOREIGN KEY ("challengeId") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beats" ADD CONSTRAINT "beats_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motivationalStatements" ADD CONSTRAINT "motivationalStatements_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moveConcepts" ADD CONSTRAINT "moveConcepts_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_challengeId_challenges_id_fk" FOREIGN KEY ("challengeId") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;