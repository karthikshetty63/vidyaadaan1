import { Router } from "express";
import { getEmailPreferences, updateEmailPreferences } from "../controllers/emailPreferenceController.js";
import { countNotifications, listNotifications, markNotificationsSeen } from "../controllers/notificationController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// A school's, NGO's or donor's own notifications. Admins have the Control Tower instead.
const router = Router();

router.use(requireAuth, requireRole("school", "ngo", "donor"));

router.get("/", listNotifications);
router.get("/count", countNotifications);
router.post("/seen", markNotificationsSeen);
// NGOs and donors: whether to get an email when a new school need is approved.
router.get("/preferences", requireRole("ngo", "donor"), getEmailPreferences);
router.patch("/preferences", requireRole("ngo", "donor"), updateEmailPreferences);

export default router;
