import { Router } from "express";
import { forgotPassword, googleLogin, login, logout, me, register, resetPassword } from "../controllers/authController.js";
import { sendEmailCode, verifyEmailCode } from "../controllers/registrationCheckController.js";
import requireAuth from "../middleware/authMiddleware.js";
import acceptUploads from "../middleware/uploadMiddleware.js";

// Rate limiters are created per app (see app.js) and passed in.
const createAuthRouter = ({ loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter, emailCodeLimiter, verifyEmailLimiter }) => {
    const router = Router();

    // Confirming the email address before registering: a code is emailed, then typed back.
    router.post("/email-code", emailCodeLimiter, sendEmailCode);
    router.post("/verify-email", verifyEmailLimiter, verifyEmailCode);
    router.post("/register", registerLimiter, acceptUploads, register);
    router.post("/login", loginLimiter, login);
    // Shares the login limiter: failed sign-ins of either kind count together.
    router.post("/google", loginLimiter, googleLogin);
    router.get("/me", requireAuth, me);
    router.post("/logout", logout);
    router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
    router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

    return router;
};

export default createAuthRouter;
