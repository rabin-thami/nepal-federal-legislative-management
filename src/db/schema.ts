import { not, relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/*==================
Enums 
===================*/
export const committeeType = pgEnum("committee_type", ["HoR", "NA"]);

/*==================
Commitee schema 
===================*/

export const committee = pgTable("committee", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  type: committeeType("type").notNull(),
  name: text("name").notNull().unique(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  introduction: text("introduction").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
