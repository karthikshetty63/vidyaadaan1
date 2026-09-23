import { Router } from "express";
import { getFile } from "../controllers/fileController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = Router();

// Ownership / admin access is checked inside getFile.
router.get("/:id", requireAuth, getFile);

export default router;
