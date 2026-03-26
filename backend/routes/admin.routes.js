import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { listUsers, listWinners } from "../controllers/admin.controller.js";

const router = Router();

router.get("/users", requireAdmin, listUsers);
router.get("/winners", requireAdmin, listWinners);

export default router;

