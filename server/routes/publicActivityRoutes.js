import { Router } from "express";
import { listPublicActivity } from "../controllers/publicActivityController.js";

// The home page's recent-activity strip, for anyone: GET only, no sign-in. The per-IP rate limiter is
// created per app (see app.js).
const createPublicActivityRouter = ({ limiter }) => {
    const router = Router();
    router.get("/", limiter, listPublicActivity);
    return router;
};

export default createPublicActivityRouter;
