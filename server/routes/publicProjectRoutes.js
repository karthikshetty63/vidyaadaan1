import { Router } from "express";
import { getPublicProject } from "../controllers/publicProjectController.js";

// What anyone may read, signed in or not (e.g. from an alumni email): GET only, no requireAuth.
// The rate limiter (per IP) is created per app (see app.js).
const createPublicProjectRouter = ({ limiter }) => {
    const router = Router();
    router.get("/:id", limiter, getPublicProject);
    return router;
};

export default createPublicProjectRouter;
