import { Router } from "express";
import { listSchoolDonations } from "../controllers/donationController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// Confirmed donor donations to the signed-in school's projects (amounts and dates, never the donors).
const router = Router();

router.use(requireAuth, requireRole("school"));

router.get("/", listSchoolDonations);

export default router;
