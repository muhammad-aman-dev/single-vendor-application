import express from "express";
import upload from "../middleware/multerMiddleware.js";
import { adminAuthCheck } from "../middleware/adminMiddleware.js";
import {
  addCarousel,
  removeCarousel,
  getCarousels
} from "../controllers/homePageControllers.js";

const carouselRouter = express.Router();

/* ==========================================================================
   CAROUSEL ROUTES
   ========================================================================== */

// Public route to fetch banners for the store frontend
carouselRouter.get("/all", getCarousels);

// Admin route to add a banner (expects a single file field named "image")
carouselRouter.post("/add", adminAuthCheck, upload.single("image"), addCarousel);

// Admin route to delete a banner by its database ID
carouselRouter.delete("/delete/:id", adminAuthCheck, removeCarousel);

export default carouselRouter;