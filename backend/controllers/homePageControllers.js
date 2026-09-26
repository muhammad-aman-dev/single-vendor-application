import Carousel from "../models/Crousel.js";
import Product from "../models/Product.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../lib/cloudinaryUploader.js";
import { revalidateHomepage } from "../lib/revalidateFunc.js";

const logFailure = (action, error, context = {}) => {
  console.error(`\n❌ [ERROR] ${action}`);
  console.error("Message:", error.message || error);
  if (Object.keys(context).length) {
    console.error("Context:", JSON.stringify(context, null, 2));
  }
};

export const getCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, carousels });
  } catch (error) {
    logFailure("GET CAROUSELS FAILED", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch carousels",
      error: error.message,
    });
  }
};

export const addCarousel = async (req, res) => {
  console.log("\n=================================");
  console.log("🟢 ADD CAROUSEL REQUEST");
  console.log("=================================");

  try {
    const { title, redirectUrl } = req.body;

    console.log("📦 Carousel Body:", { title, redirectUrl });

    if (!req.file) {
      console.error("❌ No image file received");
      return res.status(400).json({
        success: false,
        message: "Carousel image is required",
      });
    }

    console.log("🖼️ File Received:", {
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
    });

    console.log("📤 Uploading image to Cloudinary:", req.file.originalname);

    const imageUrl = await uploadToCloudinary(
      req.file.path,
      "watch-store/carousels"
    );

    if (!imageUrl) {
      console.error("❌ Cloudinary returned no URL:", req.file.originalname);
      return res.status(400).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
      });
    }

    console.log("✅ Image uploaded to Cloudinary:", imageUrl);

    console.log("💾 Creating carousel entry in MongoDB...");

    const carousel = await Carousel.create({
      title: title ? title.trim() : "Untitled Banner",
      imageUrl,
      redirectUrl: redirectUrl ? redirectUrl.trim() : "/",
    });

    console.log("✅ Carousel created successfully");
    console.log("📦 Carousel:", {
      id: carousel._id,
      title: carousel.title,
    });
    console.log("=================================\n");

    await revalidateHomepage();

    return res.status(201).json({
      success: true,
      message: "Carousel added successfully",
      carousel,
    });
  } catch (error) {
    logFailure("ADD CAROUSEL FAILED", error, {
      body: req.body,
      file: req.file?.originalname,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to add carousel",
      error: error.message,
    });
  }
};

/* ==========================================================================
   REMOVE CAROUSEL
   ========================================================================== */
export const removeCarousel = async (req, res) => {
  console.log("\n=================================");
  console.log("🔴 REMOVE CAROUSEL REQUEST");
  console.log("=================================");

  try {
    const { id } = req.params;
    console.log("🔎 Searching Carousel ID:", id);

    const carousel = await Carousel.findById(id);

    if (!carousel) {
      console.error("❌ Carousel not found:", id);
      return res.status(404).json({
        success: false,
        message: "Carousel banner not found",
      });
    }

    // =================================================
    // DELETE IMAGE FROM CLOUDINARY
    // =================================================
    if (carousel.imageUrl) {
      console.log("🗑️ Deleting image from Cloudinary:", carousel.imageUrl);
      await deleteFromCloudinary(carousel.imageUrl);
    }

    // =================================================
    // DELETE DATABASE RECORD
    // =================================================
    await Carousel.findByIdAndDelete(id);

    console.log("✅ Carousel deleted successfully from Database");
    console.log("=================================\n");

    await revalidateHomepage();

    return res.status(200).json({
      success: true,
      message: "Carousel banner removed successfully",
    });
  } catch (error) {
    logFailure("REMOVE CAROUSEL FAILED", error, { id: req.params.id });

    return res.status(500).json({
      success: false,
      message: "Failed to delete carousel banner",
      error: error.message,
    });
  }
};

const productCardFields = {
  _id: 1,
  productId: 1,
  name: 1,
  slug: 1,
  price: 1,
  comparePrice: 1,
  stock: 1,
  images: {
    $slice: ["$images", 1],
  },
};

export const getHomepageContent = async (req, res) => {
  try {
    const [carousels, featuredProducts, latestProducts, saleProducts] =
      await Promise.all([
        Carousel.find()
          .select("title imageUrl redirectUrl")
          .sort({ createdAt: -1 })
          .lean(),

        Product.aggregate([
          {
            $match: {
              status: "Active",
              featured: true,
            },
          },
          {
            $sample: {
              size: 8,
            },
          },
          {
            $project: productCardFields,
          },
        ]),

        Product.aggregate([
          {
            $match: {
              status: "Active",
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 8,
          },
          {
            $sample: {
              size: 8,
            },
          },
          {
            $project: productCardFields,
          },
        ]),

        Product.aggregate([
          {
            $match: {
              status: "Active",
              $expr: {
                $gt: ["$comparePrice", "$price"],
              },
            },
          },
          {
            $sample: {
              size: 8,
            },
          },
          {
            $project: productCardFields,
          },
        ]),
      ]);

    const homepage = {};

    if (carousels.length) {
      homepage.carousels = carousels;
    }

    if (featuredProducts.length) {
      homepage.featuredProducts = featuredProducts;
    }

    if (latestProducts.length) {
      homepage.latestProducts = latestProducts;
    }

    if (saleProducts.length) {
      homepage.saleProducts = saleProducts;
    }

    return res.status(200).json({
      success: true,
      homepage,
    });
  } catch (error) {
    console.error("GET HOMEPAGE CONTENT FAILED:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch homepage content",
      error: error.message,
    });
  }
};

export const validateCart = async (req, res) => {
  console.log("Validate Request")
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Cart items must be an array." });
    }
    if (items.length === 0) {
      return res.status(200).json({ success: true, items: [], removed: [] });
    }
    const requestedItems = items
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        productId:
          typeof item.productId === "string" ? item.productId.trim() : "",
        quantity: Number(item.quantity),
        variations:
          item.variations &&
          typeof item.variations === "object" &&
          !Array.isArray(item.variations)
            ? item.variations
            : {},
      }))
      .filter(
        (item) =>
          item.productId && Number.isInteger(item.quantity) && item.quantity > 0
      );
    if (requestedItems.length === 0) {
      return res.status(200).json({ success: true, items: [], removed: [] });
    }
    const productIds = [
      ...new Set(requestedItems.map((item) => item.productId)),
    ];
    const products = await Product.find({
      productId: { $in: productIds },
    }).lean();
    const productMap = new Map(
      products.map((product) => [product.productId, product])
    );
    const validItems = [];
    const removed = [];
    for (const requested of requestedItems) {
      const product = productMap.get(requested.productId);
      if (!product) {
        removed.push({
          productId: requested.productId,
          reason: "PRODUCT_NOT_FOUND",
        });
        continue;
      }
      if (product.status !== "Active") {
        removed.push({
          productId: product.productId,
          reason: "PRODUCT_INACTIVE",
        });
        continue;
      }
      let availableStock = Number(product.stock || 0);
      const selectedVariations = requested.variations || {};
      if (Array.isArray(product.variations) && product.variations.length > 0) {
        let invalidVariation = false;
        for (const [option, selectedValue] of Object.entries(
          selectedVariations
        )) {
          const variation = product.variations.find(
            (item) => item.option === option
          );
          if (!variation) {
            invalidVariation = true;
            break;
          }
          const variationValue = variation.values?.find(
            (value) => value.value === selectedValue
          );
          if (!variationValue) {
            invalidVariation = true;
            break;
          }
          availableStock = Number(variationValue.stock || 0);
        }
        if (invalidVariation) {
          removed.push({
            productId: product.productId,
            reason: "INVALID_VARIATION",
            variations: selectedVariations,
          });
          continue;
        }
      }
      if (availableStock <= 0) {
        removed.push({ productId: product.productId, reason: "OUT_OF_STOCK" });
        continue;
      }
      const quantity = Math.min(requested.quantity, availableStock);
      const image =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]?.url || ""
          : "";
      validItems.push({
        productId: product.productId,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        quantity,
        image,
        variations: selectedVariations,
        stock: availableStock,
      });
    }
    return res.status(200).json({ success: true, items: validItems, removed });
  } catch (error) {
    console.error("Validate cart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to validate cart." });
  }
};
