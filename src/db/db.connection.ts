import {NodePgDatabase,drizzle} from "drizzle-orm/node-postgres";
import {Connect} from "../config/connect"
import {Pool} from "pg";
import * as schema from "./schema";

const pool=new Pool({
    connectionString:Connect.DATABASE_URL,
});

export const DB:NodePgDatabase<typeof schema>=drizzle(pool,{schema});