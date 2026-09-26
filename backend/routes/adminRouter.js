import express from "express";
import {
  createShipping,
  getAllShipping,
  updateShipping,
  deleteShipping,
  activateShipping,
  getActiveShipping,
} from "../controllers/adminController.js";
import { adminAuthCheck } from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

adminRouter.post("/create-shipping", adminAuthCheck, createShipping);
adminRouter.get("/all-shipping", adminAuthCheck, getAllShipping);
adminRouter.put("/update-shipping/:id", adminAuthCheck, updateShipping);
adminRouter.delete("/del-shipping/:id", adminAuthCheck, deleteShipping);
adminRouter.patch("/activate-shipping/:id/activate", adminAuthCheck, activateShipping); 

export default adminRouter; 