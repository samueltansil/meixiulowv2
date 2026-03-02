import { db } from "./db";
import { users } from "@shared/schema";

async function migrate() {
  try {
    console.log("Starting emailVerified migration for all users...");
    const updated = await db
      .update(users)
      .set({ emailVerified: true })
      .returning({ id: users.id, email: users.email });
    console.log(`Migration complete. Updated ${updated.length} users.`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

migrate();

