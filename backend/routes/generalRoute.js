import express from "express";
import { getAllCategories } from "../controllers/categoryController.js";
import { getHomepageContent, validateCart } from "../controllers/homePageControllers.js";
import {
  getCatalogProducts,
  getDynamicCollectionProducts,
  searchProducts,
  getProductBySlug,
} from "../controllers/productController.js";
import { getActiveShipping } from "../controllers/adminController.js";

const generalRouter = express.Router();

generalRouter.get("/category/all", getAllCategories);
generalRouter.get("/homepagedata/all", getHomepageContent);
generalRouter.get("/catalog", getCatalogProducts);
generalRouter.get("/search", searchProducts);
generalRouter.get("/collections/dynamic", getDynamicCollectionProducts);
generalRouter.get("/products/:slug", getProductBySlug);
generalRouter.post("/cart/validate", validateCart);
generalRouter.get( "/shipping/get-active", getActiveShipping );

export default generalRouter;
