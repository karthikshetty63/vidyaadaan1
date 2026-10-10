import { Router } from "express";
import { previewMapLink, removeMapLocation, saveMapLocation } from "../controllers/mapLocationController.js";
import { removePaymentQr, savePaymentQr } from "../controllers/paymentQrController.js";
import { getMyProfile, removePhoto, replacePhoto, updateDonorProfile, updateNgoProfile, updateSchoolProfile } from "../controllers/profileController.js";
import requireAuth from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import acceptUploads from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyProfile);
router.patch("/school", requireRole("school"), updateSchoolProfile);
router.patch("/ngo", requireRole("ngo"), updateNgoProfile);
router.patch("/donor", requireRole("donor"), updateDonorProfile);
router.put("/photo", requireRole("school"), acceptUploads, replacePhoto);
router.delete("/photo", requireRole("school"), removePhoto);
router.put("/payment-qr", requireRole("school"), savePaymentQr);
router.delete("/payment-qr", requireRole("school"), removePaymentQr);
router.post("/map-location/resolve", requireRole("school"), previewMapLink);
router.put("/map-location", requireRole("school"), saveMapLocation);
router.delete("/map-location", requireRole("school"), removeMapLocation);

export default router;
