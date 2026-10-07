import { Router } from "express";
import { alumniSummary, createAlumni, listAlumni, setAlumniStatus, updateAlumni } from "../controllers/alumniController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// A signed-in, approved school managing its own alumni list. NGOs, donors and admins get 403.
const router = Router();

router.use(requireAuth, requireRole("school"));

router.get("/", listAlumni);
router.get("/summary", alumniSummary);
router.post("/", createAlumni);
router.patch("/:id", updateAlumni);
router.patch("/:id/status", setAlumniStatus);

export default router;
