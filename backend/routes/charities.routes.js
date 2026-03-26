import { Router } from "express";
import {
  createCharity,
  deleteCharity,
  listCharities,
  setMyCharitySelection,
  updateCharity,
  getMyCharitySelection
} from "../controllers/charities.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.get("/", listCharities);
router.get("/me", getMyCharitySelection);
router.put("/me", setMyCharitySelection);

// admin CRUD
router.post("/", requireAdmin, createCharity);
router.patch("/:id", requireAdmin, updateCharity);
router.delete("/:id", requireAdmin, deleteCharity);

export default router;

