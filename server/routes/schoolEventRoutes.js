import { Router } from "express";
import { createEvent, listMyEvents, respondToOffer, updateMyEvent } from "../controllers/eventController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// A signed-in, approved school managing its own events and answering offers of help.
const router = Router();

router.use(requireAuth, requireRole("school"));

router.get("/", listMyEvents);
router.post("/", createEvent);
router.patch("/:id", updateMyEvent);
router.patch("/:id/offers/:offerId", respondToOffer);

export default router;
