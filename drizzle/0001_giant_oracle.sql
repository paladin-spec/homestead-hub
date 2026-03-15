ALTER TABLE "plants" ADD COLUMN "stage" varchar(50) DEFAULT 'seeded' NOT NULL;--> statement-breakpoint
ALTER TABLE "plants" ADD COLUMN "plant_count" integer DEFAULT 1 NOT NULL;