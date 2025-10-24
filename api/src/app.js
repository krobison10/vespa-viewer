import express from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

import config from "./config/index.js";

import { initDB, getDB } from "./connections/db.js";

import { errorHandler, rateLimiterByMethod } from "./middleware/middlewares.js";
import { NotFoundError } from "./utils/APIError.js";

const app = express();

// Initialize the database
await initDB();

// Create PostgreSQL session store
const PgSession = connectPgSimple(session);
const pgStore = new PgSession({
  pool: getDB(),
  tableName: "session",
  createTableIfMissing: true,
});

app.set("trust proxy", 1);

// https://expressjs.com/en/resources/middleware/session.html
app.use(
  session({
    store: pgStore,
    secret: config.sessionSecret,
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days
      sameSite: "lax",
      secure: config.nodeEnv === "production",
    },
  })
);

// Global middlewares
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "120mb" }));
app.use(
  express.json({
    limit: "120mb",
    verify: (req, res, buf) => (req.rawBody = buf), // Keep access to raw body
  })
);

// General global middlewares
app.use((req, res, next) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  next();
});

// Default error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// Global rate limiter as a backup
app.use(
  rateLimiterByMethod("root", {
    getLimit: 240,
    postLimit: 240,
    putLimit: 240,
    deleteLimit: 240,
  })
);

// ---------- API routes ----------
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

import { router as authRouter } from "./auth/index.js";
app.use("/auth", authRouter);

import { router as userRouter } from "./user/index.js";
app.use("/user", userRouter);

import { router as dataSourceRouter } from "./data-source/index.js";
app.use("/data-source", dataSourceRouter);

// Not found handler
app.use(() => {
  throw new NotFoundError("Resource not found");
});

app.use(errorHandler);

// eslint-disable-next-line no-undef
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception", err);
});

app.listen(config.port, () => {
  console.log(`Server is running on http://127.0.0.1:${config.port}`);
});

export default app;
