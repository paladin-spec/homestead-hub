CREATE TABLE "chicken_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"notes" text,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chickens" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"breed" varchar(255),
	"hatch_date" date,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egg_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"collected_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(255),
	"make" varchar(255),
	"model" varchar(255),
	"year" integer,
	"serial_number" varchar(255),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firewood_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"species" varchar(255) NOT NULL,
	"diameter_inches" numeric(6, 2) NOT NULL,
	"length_inches" numeric(6, 2) NOT NULL,
	"piece_count" integer DEFAULT 1 NOT NULL,
	"cords_estimate" numeric(8, 4),
	"btu_estimate" numeric(12, 2),
	"notes" text,
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homestead" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) DEFAULT 'My Homestead' NOT NULL,
	"location" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"cost" numeric(10, 2),
	"performed_by" varchar(255),
	"next_due_date" date,
	"performed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "plant_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"notes" text,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"variety" varchar(255),
	"location" varchar(255),
	"planted_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_logs" ADD CONSTRAINT "plant_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;