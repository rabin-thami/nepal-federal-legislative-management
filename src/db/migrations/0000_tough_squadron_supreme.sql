CREATE TYPE "public"."committee_type" AS ENUM('HoR', 'NA');--> statement-breakpoint
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
