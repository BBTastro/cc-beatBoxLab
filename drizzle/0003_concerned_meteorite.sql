CREATE TABLE "userActivity" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"email" text NOT NULL,
	"activityType" text NOT NULL,
	"pageUrl" text,
	"action" text,
	"sessionId" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userSessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"email" text NOT NULL,
	"signInAt" timestamp DEFAULT now() NOT NULL,
	"signOutAt" timestamp,
	"sessionDuration" integer,
	"ipAddress" text,
	"userAgent" text,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userActivity" ADD CONSTRAINT "userActivity_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userActivity" ADD CONSTRAINT "userActivity_sessionId_userSessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."userSessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userSessions" ADD CONSTRAINT "userSessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;