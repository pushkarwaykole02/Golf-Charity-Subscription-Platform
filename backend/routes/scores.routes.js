import { Router } from "express";
import { addMyScore, listMyScores } from "../controllers/scores.controller.js";

const router = Router();

router.get("/me", listMyScores);
router.post("/me", addMyScore);

export default router;

