import { Router } from "express";
import { listMyOffers, listOpenEvents, offerHelp, withdrawOffer } from "../controllers/eventSupportController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

// Approved school events for verified NGOs and donors: see them and offer help.
const router = Router();

router.use(requireAuth, requireRole("ngo", "donor"));

router.get("/", listOpenEvents);
router.get("/mine", listMyOffers);
router.post("/:id/offers", offerHelp);
router.delete("/:id/offers", withdrawOffer);

export default router;
