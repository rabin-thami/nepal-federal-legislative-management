import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db/drizzle";

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "src/db/migrations",
    });

    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();
