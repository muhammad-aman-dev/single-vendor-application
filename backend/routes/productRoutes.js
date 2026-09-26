// routes/productRoutes.js

import express from "express";
import upload from "../middleware/multerMiddleware.js";
import { adminAuthCheck } from "../middleware/adminMiddleware.js";
import {
  addCategory,
  removeCategory,
} from "../controllers/categoryController.js";

import {
  addProduct,
  editProduct,
  removeProduct,
  getAllProductsAdmin,
  updateProductStatus,
  getAdminProductBySlug
} from "../controllers/productController.js";

const productRouter = express.Router();

/* ==========================================================================
   CATEGORY ROUTES
   ========================================================================== */

// Add new category
productRouter.post("/category/add", adminAuthCheck, upload.single("image"), addCategory);

// Delete category
productRouter.delete("/category/delete/:id", adminAuthCheck, removeCategory);

/* ==========================================================================
   PRODUCT ROUTES
   ========================================================================== */

productRouter.post(
  "/add-product",
  upload.array("images", 6),
  adminAuthCheck,
  addProduct
);

productRouter.put(
  "/edit/update/:slug",
  upload.array("images", 6),
  adminAuthCheck,
  editProduct 
);

productRouter.delete(
  "/:slug",
  adminAuthCheck,
  removeProduct
);

productRouter.get("/admin/all", adminAuthCheck, getAllProductsAdmin);

// Quick status toggle endpoint
productRouter.patch("/status/:id", adminAuthCheck, updateProductStatus);


productRouter.get("/get-product-edit/:slug", adminAuthCheck, getAdminProductBySlug);

export default productRouter;