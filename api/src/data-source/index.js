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

// Console routes
router.get("/:dataSourceId/console", dataSourceHandler.getAllConsoles);
router.post("/:dataSourceId/console", dataSourceHandler.createConsole);
router.get("/:dataSourceId/console/:id", dataSourceHandler.getConsole);
router.put("/:dataSourceId/console/:id", dataSourceHandler.updateConsole);
router.delete("/:dataSourceId/console/:id", dataSourceHandler.removeConsole);

// Query execution route
router.post(
  "/:dataSourceId/console/:id/execute",
  dataSourceHandler.executeQuery
);

export { router };
