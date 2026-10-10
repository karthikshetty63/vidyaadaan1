import { Router } from "express";
import {
    monitorActivity, monitorActivityEvent, monitorChecks, monitorDonations, monitorDonors, monitorNgoPayments, monitorNgos, monitorOverview,
    monitorProjects, monitorSchools,
} from "../controllers/adminMonitorController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// The admin Control Tower: read-only monitoring. Mounted under /api/admin (which already requires an
// admin); the check is repeated here so these routes stay admin-only wherever they are mounted.
// GET only: nothing here can change a record.
const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/overview", monitorOverview);
router.get("/checks", monitorChecks);
router.get("/schools", monitorSchools);
router.get("/ngos", monitorNgos);
router.get("/donors", monitorDonors);
router.get("/projects", monitorProjects);
router.get("/ngo-payments", monitorNgoPayments);
router.get("/donations", monitorDonations);
router.get("/activity", monitorActivity);
router.get("/activity/:id", monitorActivityEvent);

export default router;
