import { Router } from "express";
import { getPersona, sendMessage } from "../controllers/chatbotController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

// The help assistant, for everyone: signed-in users get their role's assistant, everyone else the alumni &
// visitor one. The rate limiter (per account, or per IP for visitors) is created per app (see app.js).
const createChatbotRouter = ({ limiter }) => {
    const router = Router();
    router.use(optionalAuth);
    router.get("/persona", getPersona);
    router.post("/message", limiter, sendMessage);
    return router;
};

export default createChatbotRouter;
