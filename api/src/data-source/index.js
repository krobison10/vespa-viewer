import express from "express";

import { requireAuth, rateLimiterByMethod } from "../middleware/middlewares.js";

import * as dataSourceHandler from "./data-source-handler.js";

const router = express.Router();

router.use(rateLimiterByMethod("data-source"));

router.use(requireAuth);

router.get("/", dataSourceHandler.getAll);
router.get("/:id", dataSourceHandler.getOne);
router.post("/", dataSourceHandler.create);
router.put("/:id", dataSourceHandler.update);
router.delete("/:id", dataSourceHandler.remove);

export { router };
