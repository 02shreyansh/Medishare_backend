import { Pool } from "pg";
import { Connect } from "./src/config/connect";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function runMigration() {
    try {
        console.log("Running migration...");
        const pool = new Pool({ connectionString: Connect.DATABASE_URL });
        try {
            await pool.query(`
                DO $$
                BEGIN
                    -- If the Status enum exists but we need to recreate it
                    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
                        -- Check if there are tables using this enum
                        IF EXISTS (
                            SELECT 1 FROM pg_attribute a
                            JOIN pg_class c ON a.attrelid = c.oid
                            JOIN pg_type t ON a.atttypid = t.oid
                            WHERE t.typname = 'status'
                        ) THEN
                            -- Cannot drop the enum if it's in use
                            NULL;
                        ELSE
                            -- Safe to drop
                            DROP TYPE "Status";
                        END IF;
                    END IF;
                    
                EXCEPTION WHEN OTHERS THEN
                    -- Just log and continue
                    RAISE NOTICE 'Error handling enum: %', SQLERRM;
                END $$;
            `);
        } catch (e) {
            console.log("Enum preparation step encountered an error, continuing:", e);
        }
        
        const db = drizzle(pool);
        await migrate(db, { migrationsFolder: "./src/db/migrations" });
        
        console.log("Migration completed successfully.");
        pool.end();
    } catch (error) {
        console.log("migration error", error);
    }
}

runMigration();