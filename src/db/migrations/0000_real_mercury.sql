CREATE TYPE "public"."bill_category" AS ENUM('governmental', 'non_governmental');--> statement-breakpoint
CREATE TYPE "public"."bill_house" AS ENUM('pratinidhi_sabha', 'rastriya_sabha');--> statement-breakpoint
CREATE TYPE "public"."bill_status" AS ENUM('registered', 'first_reading', 'general_discussion', 'amendment_window', 'committee_review', 'clause_voting', 'first_house_passed', 'second_house', 'joint_sitting', 'speaker_certification', 'assented', 'gazette_published', 'amendment_or_repeal');--> statement-breakpoint
CREATE TYPE "public"."bill_type" AS ENUM('original', 'amendment');--> statement-breakpoint
CREATE TYPE "public"."committee_type" AS ENUM('HoR', 'NA');--> statement-breakpoint
CREATE TYPE "public"."status_source" AS ENUM('parliament_scrape', 'gazette_scrape', 'manual_entry');--> statement-breakpoint
CREATE TABLE "bill_committee_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" uuid NOT NULL,
	"committee_id" integer NOT NULL,
	"assigned_date_bs" text,
	"assigned_date_ad" date,
	"report_submitted_date_bs" text,
	"report_submitted_date_ad" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bill_status_history" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL,
	"status" "bill_status" NOT NULL,
	"raw_status" text,
	"source" "status_source" DEFAULT 'parliament_scrape',
	"status_date_bs" text,
	"status_date_ad" date,
	"notes" text,
	"source_url" text,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"parliament_id" text,
	"registration_no" text NOT NULL,
	"year" text NOT NULL,
	"session" text,
	"title_np" text,
	"title_en" text,
	"presenter" text,
	"ministry" text,
	"house" "bill_house",
	"bill_type" "bill_type",
	"category" "bill_category",
	"current_status" "bill_status",
	"current_phase" integer,
	"registered_date_bs" text,
	"authenticated_date_bs" text,
	"registered_date_ad" date,
	"authenticated_date_ad" date,
	"registered_bill_url" text,
	"authenticated_bill_url" text,
	"parliament_url" text,
	"last_scraped_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bills_parliament_id_unique" UNIQUE("parliament_id")
);
--> statement-breakpoint
CREATE TABLE "committee" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"type" "committee_type" NOT NULL,
	"name" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"introduction" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "committee_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "committees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_np" text,
	"name_en" text,
	"house" "bill_house",
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scrape_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	"bills_found" integer DEFAULT 0,
	"bills_updated" integer DEFAULT 0,
	"bills_new" integer DEFAULT 0,
	"errors" text,
	"status" text
);
--> statement-breakpoint
ALTER TABLE "bill_committee_assignments" ADD CONSTRAINT "bill_committee_assignments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_committee_assignments" ADD CONSTRAINT "bill_committee_assignments_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_status_history" ADD CONSTRAINT "bill_status_history_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bill_status_history_bill_id_idx" ON "bill_status_history" USING btree ("bill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bills_reg_no_year_idx" ON "bills" USING btree ("registration_no","year");--> statement-breakpoint
CREATE INDEX "bills_status_idx" ON "bills" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "bills_house_idx" ON "bills" USING btree ("house");--> statement-breakpoint
CREATE INDEX "bills_ministry_idx" ON "bills" USING btree ("ministry");