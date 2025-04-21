import { defineConfig } from "drizzle-kit";
import { Connect} from "./src/config/connect";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: Connect.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
