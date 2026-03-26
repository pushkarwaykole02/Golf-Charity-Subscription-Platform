import { Router } from "express";
import { createMonthlyDraw, getCurrentDraw, listDraws } from "../controllers/draws.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.get("/", listDraws);
router.get("/current", getCurrentDraw);
router.post("/", requireAdmin, createMonthlyDraw);

export default router;

