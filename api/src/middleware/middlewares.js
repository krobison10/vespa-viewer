import { rateLimit } from "express-rate-limit";

import { UnauthorizedError, TooManyRequestsError } from "../utils/APIError.js";

// import config from "../config/index.js";

export function requireAuth(req, res, next) {
  if (!req.session?.isLoggedIn) {
    throw new UnauthorizedError("Authentication required");
  }

  if (!req.session?.uid || !req.session?.email) {
    throw new UnauthorizedError("Invalid session");
  }

  next();
}

export function requireOnboarded(req, res, next) {
  if (!req.session.completedOnboarding) {
    throw new UnauthorizedError(
      "You must complete onboarding to continue, please contact support if this error persists."
    );
  }

  next();
}

export function requireAPIAccess(req, res, next) {
  requireAuth(req, res, () => {
    requireOnboarded(req, res, () => {
      next();
    });
  });
}

// const productionError = (err, res) => {
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//       error: err,
//     });
//   } else {
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: err,
//     });
//   }
// };

const developmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log("\n\n------ begin: ------");
  console.log("ERROR: ", err);
  console.log("------ end: ------\n\n");

  // Always show error for now
  developmentError(err, res);

  // if (config.nodeEnv === "development") {
  //   developmentError(err, res);
  // }

  // if (config.nodeEnv === "production") {
  //   productionError(err, res);
  // }
}

export function rateLimiterByMethod(endpoint = "general", options = {}) {
  const handler = (req, res, next) => {
    const error = new TooManyRequestsError(
      "Too many requests, please try again or contact support if the problem persists"
    );
    next(error);
  };

  const limiters = {
    GET: rateLimit({
      windowMs: options.getWindowMs || 1 * 60 * 1000,
      limit: options.getLimit || 100,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${endpoint}:GET:${req.sessionID || req.ip}`,
      handler,
    }),
    POST: rateLimit({
      windowMs: options.postWindowMs || 1 * 60 * 1000,
      limit: options.postLimit || 30,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${endpoint}:POST:${req.sessionID || req.ip}`,
      handler,
    }),
    PUT: rateLimit({
      windowMs: options.putWindowMs || 1 * 60 * 1000,
      limit: options.putLimit || 30,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${endpoint}:PUT:${req.sessionID || req.ip}`,
      handler,
    }),
    DELETE: rateLimit({
      windowMs: options.deleteWindowMs || 1 * 60 * 1000,
      limit: options.deleteLimit || 30,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${endpoint}:DELETE:${req.sessionID || req.ip}`,
      handler,
    }),
    DEFAULT: rateLimit({
      windowMs: options.defaultWindowMs || 1 * 60 * 1000,
      limit: options.defaultLimit || 60,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${endpoint}:${req.sessionID || req.ip}`,
      handler,
    }),
  };

  // Return middleware that selects the appropriate pre-created limiter
  return (req, res, next) => {
    const method = req.method.toUpperCase();
    if (limiters[method]) {
      return limiters[method](req, res, next);
    }
    return limiters.DEFAULT(req, res, next);
  };
}

export function rateLimiter(endpoint = "general", options = {}) {
  const handler = (req, res, next) => {
    const error = new TooManyRequestsError(
      "Too many requests, please try again or contact support if the problem persists"
    );
    next(error);
  };

  return rateLimit({
    windowMs: options.windowMs || 1 * 60 * 1000,
    limit: options.limit || 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${endpoint}:${req.sessionID || req.ip}`,
    handler,
  });
}
