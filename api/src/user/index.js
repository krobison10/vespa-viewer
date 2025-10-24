import express from "express";

import { requireAuth, rateLimiterByMethod } from "../middleware/middlewares.js";

import * as userHandler from "./user-handler.js";

const router = express.Router();

router.use(rateLimiterByMethod("user"));

router.use(requireAuth);

router.put("/", userHandler.update);

export { router };
