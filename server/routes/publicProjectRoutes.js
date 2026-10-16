import { Router } from "express";
import { getPublicProject, listPublicProjects } from "../controllers/publicProjectController.js";

// What anyone may read, signed in or not (e.g. from an alumni email): GET only, no requireAuth.
// The rate limiter (per IP) is created per app (see app.js).
const createPublicProjectRouter = ({ limiter }) => {
    const router = Router();
    router.get("/", limiter, listPublicProjects);
    router.get("/:id", limiter, getPublicProject);
    return router;
};

export default createPublicProjectRouter;
