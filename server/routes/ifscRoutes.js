import { Router } from "express";
import { lookupBranch } from "../controllers/registrationCheckController.js";

// No sign-in: the school registration form looks up the bank branch of the IFSC typed. The rate limiter
// (per IP) is created per app (see app.js).
const createIfscRouter = ({ limiter }) => {
    const router = Router();
    router.get("/:code", limiter, lookupBranch);
    return router;
};

export default createIfscRouter;
