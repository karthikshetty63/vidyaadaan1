import { Router } from "express";
import { forgotPassword, login, logout, me, register, resetPassword } from "../controllers/authController.js";
import requireAuth from "../middleware/authMiddleware.js";
import acceptUploads from "../middleware/uploadMiddleware.js";

// Rate limiters are created per app (see app.js) and passed in.
const createAuthRouter = ({ loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter }) => {
    const router = Router();

    router.post("/register", registerLimiter, acceptUploads, register);
    router.post("/login", loginLimiter, login);
    router.get("/me", requireAuth, me);
    router.post("/logout", logout);
    router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
    router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

    return router;
};

export default createAuthRouter;
