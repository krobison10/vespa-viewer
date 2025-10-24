import express from "express";

import { requireAuth, rateLimiterByMethod } from "../middleware/middlewares.js";

import * as authHandler from "./auth-handler.js";

const router = express.Router();

router.use(
  rateLimiterByMethod("auth", {
    getLimit: 100,
    postLimit: 15,
  })
);

router.post("/login", authHandler.login);
router.get("/google", authHandler.loginGoogle);
router.post("/logout", authHandler.logout);
router.get("/check", authHandler.check);

router.use(requireAuth); // Following routes require auth

router.get("/me", authHandler.me);

export { router };
