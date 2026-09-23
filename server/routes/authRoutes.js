import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import requireAuth from "../middleware/authMiddleware.js";
import acceptUploads from "../middleware/uploadMiddleware.js";

// Rate limiters are created per app (see app.js) and passed in.
const createAuthRouter = ({ loginLimiter, registerLimiter }) => {
    const router = Router();

    router.post("/register", registerLimiter, acceptUploads, register);
    router.post("/login", loginLimiter, login);
    router.get("/me", requireAuth, me);
    router.post("/logout", logout);

    return router;
};

export default createAuthRouter;
