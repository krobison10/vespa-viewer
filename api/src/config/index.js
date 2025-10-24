/* eslint-disable no-undef */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct an absolute path to the .env file
const envPath = path.resolve(__dirname, `../../.env`);
console.log(`Loading environment from: ${envPath}`);

// Load the environment variables
dotenv.config({ path: envPath });

export default {
  // Environment
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || "production",

  // DB
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,

  // Session
  sessionSecret: process.env.SESSION_SECRET || "asdfhk4j5hjkqhdasfadsf",
};
