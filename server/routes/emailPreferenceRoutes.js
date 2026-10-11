import { Router } from "express";
import { stopNewNeedEmails } from "../controllers/emailPreferenceController.js";

// The "Stop these emails" link's page, for anyone holding the link (no sign-in). The token in the link
// says whose emails it stops. The rate limiter (per IP) is created per app (see app.js).
const createEmailPreferenceRouter = ({ limiter }) => {
    const router = Router();
    router.post("/stop", limiter, stopNewNeedEmails);
    return router;
};

export default createEmailPreferenceRouter;
