import { Router } from "express";
import { getMySubscription, upsertMySubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.get("/me", getMySubscription);
router.put("/me", upsertMySubscription);

export default router;

