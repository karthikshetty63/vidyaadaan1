import { Router } from "express";
import { approveAccount, getAccount, listAccounts, rejectAccount } from "../controllers/adminController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

// Every admin route: logged in (cookie) AND role === "admin" according to the database.
router.use(requireAuth, requireRole("admin"));

router.get("/accounts", listAccounts);
router.get("/accounts/:id", getAccount);
router.patch("/accounts/:id/approve", approveAccount);
router.patch("/accounts/:id/reject", rejectAccount);

export default router;
