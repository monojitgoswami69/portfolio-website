ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "communications" DROP CONSTRAINT "communications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "weekly_metrics" DROP CONSTRAINT "weekly_metrics_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "communications" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "weekly_metrics" DROP COLUMN "user_id";