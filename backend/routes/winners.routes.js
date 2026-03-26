import { Router } from "express";
import {
  adminSetWinnerStatus,
  claimMyWin,
  computeMyMatch,
  getMyWinnerRecord,
  submitMyProof
} from "../controllers/winners.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.get("/:drawId/match", computeMyMatch);
router.get("/:drawId/me", getMyWinnerRecord);
router.post("/:drawId/claim", claimMyWin);
router.post("/:drawId/proof", submitMyProof);

router.patch("/:id/status", requireAdmin, adminSetWinnerStatus);

export default router;

