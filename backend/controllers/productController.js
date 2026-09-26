// controllers/productController.js

import Product from "../models/Product.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../lib/cloudinaryUploader.js";

import {
  revalidateHomepageInBackground,
  revalidateProductInBackground,
} from "../lib/revalidateFunc.js";

// =====================================================
// SERVER FAILURE LOGGER
// =====================================================

const logFailure = (action, error, extra = {}) => {
  console.error("\n=================================");
  console.error(`❌ ${action}`);
  console.error("=================================");

  if (Object.keys(extra).length > 0) {
    console.error("📦 Details:", extra);
  }

  if (error) {
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
  }

  console.error("=================================\n");
};

export const addProduct = async (req, res) => {
  console.log("\n=================================");
  console.log("🟢 ADD PRODUCT REQUEST");
  console.log("=================================");

  try {
    const {
      name,
      slug,
      description,
      detailedDescription,
      category,
      gender,
      price,
      comparePrice,
      stock,
      featured,
      variations,
      seo,
      imageAlts,
    } = req.body;

    console.log("📦 Product Body:", {
      name,
      slug,
      category,
      gender,
      price,
      comparePrice,
      stock,
      featured,
    });

    console.log(
      "🖼️ Files:",
      req.files?.map((file) => ({
        name: file.originalname,
        path: file.path,
        size: file.size,
      })) || []
    );

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !slug || !description || !category || price === undefined) {
      console.error("❌ Validation Failed: Required fields missing");

      return res.status(400).json({
        success: false,
        message: "Name, slug, description, category and price are required",
      });
    }

    const cleanSlug = slug.toLowerCase().trim();

    // Valid genders allowed by model
    const validGenders = ["Men", "Women", "Unisex", "Kids", "All"];
    let formattedGender = "Unisex";

    if (gender && validGenders.includes(gender.trim())) {
      formattedGender = gender.trim();
    }

    // =================================================
    // CHECK UNIQUE SLUG
    // =================================================

    console.log("🔎 Checking slug:", cleanSlug);

    const existingProduct = await Product.findOne({
      slug: cleanSlug,
    });

    if (existingProduct) {
      console.error("❌ Duplicate Slug:", cleanSlug);

      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    // =================================================
    // PARSE IMAGE ALTS
    // =================================================

    let parsedAlts = [];
    if (imageAlts) {
      try {
        parsedAlts =
          typeof imageAlts === "string" ? JSON.parse(imageAlts) : imageAlts;
      } catch (error) {
        logFailure("INVALID IMAGE ALTS JSON", error, { imageAlts });
      }
    }

    // =================================================
    // UPLOAD IMAGES
    // =================================================

    const images = [];

    if (req.files && req.files.length > 0) {
      console.log(`🖼️ Uploading ${req.files.length} image(s)...`);

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          console.log("📤 Uploading image:", file.originalname);

          const imageUrl = await uploadToCloudinary(
            file.path,
            "watch-store/products"
          );

          if (imageUrl) {
            images.push({
              url: imageUrl,
              alt: parsedAlts[i] || name.trim(),
            });

            console.log("✅ Image uploaded with alt:", imageUrl);
          } else {
            console.error("❌ Cloudinary returned no URL:", file.originalname);
          }
        } catch (error) {
          logFailure("CLOUDINARY IMAGE UPLOAD FAILED", error, {
            file: file.originalname,
            path: file.path,
          });
        }
      }
    } else {
      console.error("❌ No product images received");
    }

    if (images.length === 0) {
      console.error("❌ Product creation failed: No images uploaded");

      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // =================================================
    // PARSE VARIATIONS
    // =================================================

    let parsedVariations = [];

    if (variations) {
      try {
        parsedVariations =
          typeof variations === "string" ? JSON.parse(variations) : variations;

        if (!Array.isArray(parsedVariations)) {
          console.error("❌ Variations must be an array");

          return res.status(400).json({
            success: false,
            message: "Variations must be an array",
          });
        }

        console.log("🎨 Variations parsed successfully");
      } catch (error) {
        logFailure("INVALID VARIATIONS JSON", error, { variations });

        return res.status(400).json({
          success: false,
          message: "Invalid variations format",
        });
      }
    }

    // =================================================
    // PARSE SEO
    // =================================================

    let parsedSeo = {};

    if (seo) {
      try {
        parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;

        console.log("🔍 SEO parsed successfully");
      } catch (error) {
        logFailure("INVALID SEO JSON", error, { seo });

        return res.status(400).json({
          success: false,
          message: "Invalid SEO format",
        });
      }
    }

    // =================================================
    // AUTO STATUS COMPUTATION
    // =================================================

    const parsedStock = stock !== undefined && stock !== "" ? Number(stock) : 0;

    let computedStatus = "Active";
    if (parsedStock <= 0) {
      computedStatus = "Out Of Stock";
    }

    // =================================================
    // CREATE PRODUCT
    // =================================================

    console.log("💾 Creating product in MongoDB...");

    const product = await Product.create({
      name: name.trim(),

      slug: cleanSlug,

      description: description.trim(),

      detailedDescription: detailedDescription?.trim(),

      category: category.trim(),

      gender: formattedGender,

      images,

      price: Number(price),

      comparePrice:
        comparePrice !== undefined && comparePrice !== ""
          ? Number(comparePrice)
          : undefined,

      stock: parsedStock,

      featured: featured === true || featured === "true",

      variations: parsedVariations,

      status: computedStatus,

      seo: parsedSeo,
    });

    console.log("✅ Product created successfully");

    console.log("📦 Product:", {
      productId: product.productId,
      slug: product.slug,
      name: product.name,
      gender: product.gender,
      status: product.status,
    });

    console.log("=================================\n");

    revalidateProductInBackground(product.slug);
    revalidateHomepageInBackground();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    logFailure("ADD PRODUCT FAILED", error, {
      body: req.body,
      files: req.files?.map((file) => file.originalname),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

export const editProduct = async (req, res) => {
  console.log("\n=================================");
  console.log("🟡 EDIT PRODUCT REQUEST");
  console.log("=================================");

  try {
    const { slug } = req.params;

    const {
      name,
      newSlug,
      description,
      detailedDescription,
      category,
      gender,
      price,
      comparePrice,
      stock,
      featured,
      status,
      variations,
      seo,
      existingImages,
      imageAlts,
    } = req.body;

    const cleanCurrentSlug = slug.toLowerCase().trim();

    console.log("🔎 Editing product:", cleanCurrentSlug);

    // =================================================
    // FIND PRODUCT
    // =================================================

    const product = await Product.findOne({
      slug: cleanCurrentSlug,
    });

    if (!product) {
      console.error("❌ Product not found:", cleanCurrentSlug);

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const oldSlug = product.slug;

    console.log("✅ Product found:", product.name);

    // =================================================
    // UPDATE SLUG
    // =================================================

    if (newSlug && newSlug.toLowerCase().trim() !== product.slug) {
      const cleanNewSlug = newSlug.toLowerCase().trim();

      console.log("🔄 Changing slug:", product.slug, "➡️", cleanNewSlug);

      const slugExists = await Product.findOne({
        slug: cleanNewSlug,
        _id: { $ne: product._id },
      });

      if (slugExists) {
        console.error("❌ New slug already exists:", cleanNewSlug);

        return res.status(400).json({
          success: false,
          message: "Product with this slug already exists",
        });
      }

      product.slug = cleanNewSlug;
    }

    // =================================================
    // PARSE IMAGE ALTS
    // =================================================

    let parsedAlts = [];
    if (imageAlts) {
      try {
        parsedAlts =
          typeof imageAlts === "string" ? JSON.parse(imageAlts) : imageAlts;
      } catch (error) {
        logFailure("INVALID IMAGE ALTS JSON ON EDIT", error, { imageAlts });
      }
    }

    // =================================================
    // EXISTING IMAGES
    // =================================================

    let updatedImages = [...product.images];

    if (existingImages !== undefined) {
      try {
        const parsedImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;

        if (!Array.isArray(parsedImages)) {
          console.error("❌ existingImages is not an array");

          return res.status(400).json({
            success: false,
            message: "existingImages must be an array",
          });
        }

        updatedImages = parsedImages;

        console.log("🖼️ Existing images received:", updatedImages.length);
      } catch (error) {
        logFailure("INVALID EXISTING IMAGES JSON", error, { existingImages });

        return res.status(400).json({
          success: false,
          message: "Invalid existingImages format",
        });
      }
    }

    // =================================================
    // DELETE REMOVED IMAGES
    // =================================================

    const existingUrls = updatedImages.map((img) =>
      typeof img === "string" ? img : img.url
    );

    const removedImages = product.images.filter((oldImg) => {
      const url = typeof oldImg === "string" ? oldImg : oldImg.url;
      return !existingUrls.includes(url);
    });

    if (removedImages.length > 0) {
      console.log(`🗑️ Removing ${removedImages.length} image(s)...`);

      for (const image of removedImages) {
        try {
          const imageUrl = typeof image === "string" ? image : image.url;
          const result = await deleteFromCloudinary(imageUrl);

          console.log("🗑️ Cloudinary delete result:", result);
        } catch (error) {
          logFailure("CLOUDINARY IMAGE DELETE FAILED", error, { image });
        }
      }
    }

    // =================================================
    // UPLOAD NEW IMAGES
    // =================================================

    if (req.files && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} new image(s)...`);

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          console.log("📤 Uploading:", file.originalname);

          const imageUrl = await uploadToCloudinary(
            file.path,
            "watch-store/products"
          );

          if (imageUrl) {
            updatedImages.push({
              url: imageUrl,
              alt: parsedAlts[i] || name || product.name,
            });

            console.log("✅ New image uploaded:", imageUrl);
          } else {
            console.error("❌ Image upload returned null:", file.originalname);
          }
        } catch (error) {
          logFailure("NEW IMAGE UPLOAD FAILED", error, {
            file: file.originalname,
            path: file.path,
          });
        }
      }
    }

    // =================================================
    // IMAGE VALIDATION
    // =================================================

    if (updatedImages.length === 0) {
      console.error("❌ Product cannot be saved without images");

      return res.status(400).json({
        success: false,
        message: "Product must have at least one image",
      });
    }

    // =================================================
    // PARSE VARIATIONS
    // =================================================

    let parsedVariations = product.variations;

    if (variations !== undefined) {
      try {
        parsedVariations =
          typeof variations === "string" ? JSON.parse(variations) : variations;

        if (!Array.isArray(parsedVariations)) {
          console.error("❌ Variations must be an array");

          return res.status(400).json({
            success: false,
            message: "Variations must be an array",
          });
        }
      } catch (error) {
        logFailure("INVALID VARIATIONS JSON DURING EDIT", error, {
          variations,
        });

        return res.status(400).json({
          success: false,
          message: "Invalid variations format",
        });
      }
    }

    // =================================================
    // PARSE SEO
    // =================================================

    let parsedSeo = product.seo;

    if (seo !== undefined) {
      try {
        parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;
      } catch (error) {
        logFailure("INVALID SEO JSON DURING EDIT", error, { seo });

        return res.status(400).json({
          success: false,
          message: "Invalid SEO format",
        });
      }
    }

    // =================================================
    // UPDATE FIELDS
    // =================================================

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (detailedDescription !== undefined) {
      product.detailedDescription = detailedDescription.trim();
    }

    if (category !== undefined) {
      product.category = category.trim();
    }

    if (gender !== undefined) {
      const validGenders = ["Men", "Women", "Unisex", "Kids", "All"];
      if (validGenders.includes(gender.trim())) {
        product.gender = gender.trim();
      }
    }

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (comparePrice !== undefined) {
      product.comparePrice =
        comparePrice === "" ? undefined : Number(comparePrice);
    }

    if (stock !== undefined) {
      product.stock = Number(stock);
    }

    if (featured !== undefined) {
      product.featured = featured === true || featured === "true";
    }

    if (status !== undefined) {
      product.status = status;
    }

    product.images = updatedImages;
    product.variations = parsedVariations;
    product.seo = parsedSeo;

    // =================================================
    // AUTO STOCK STATUS (Only override status if not explicitly sent)
    // =================================================

    if (status === undefined) {
      if (product.stock <= 0) {
        product.status = "Out Of Stock";
        console.log("📦 Product status changed to Out Of Stock");
      } else if (product.stock > 0 && product.status === "Out Of Stock") {
        product.status = "Active";
        console.log("📦 Product status changed to Active");
      }
    }

    // =================================================
    // SAVE
    // =================================================

    console.log("💾 Saving product changes...");

    await product.save();
    revalidateProductInBackground(product.slug);

    if (oldSlug !== product.slug) {
      revalidateProductInBackground(oldSlug);
    }

    revalidateHomepageInBackground();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    logFailure("EDIT PRODUCT FAILED", error, {
      slug: req.params?.slug,
      newSlug: req.body?.newSlug,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// =====================================================
// GET PRODUCT BY SLUG
// =====================================================

export const getProductBySlug = async (req, res) => {
  console.log("\n=================================");
  console.log("🟢 GET PRODUCT REQUEST");
  console.log("=================================");

  try {
    const { slug } = req.params;

    const cleanSlug = slug.toLowerCase().trim();

    console.log("🔎 Searching product:", cleanSlug);

    const product = await Product.findOne({
      slug: cleanSlug,
    });

    if (!product) {
      console.error("❌ Product not found:", cleanSlug);

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =================================================
    // INCREASE VIEWS
    // =================================================

    product.views += 1;

    await product.save();

    console.log("👁️ Product view increased:", product.views);

    console.log("✅ Product fetched successfully");

    console.log("=================================\n");

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    logFailure("GET PRODUCT FAILED", error, {
      slug: req.params?.slug,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// =====================================================
// SOFT DELETE PRODUCT BY SLUG (SET INACTIVE)
// =====================================================

export const removeProduct = async (req, res) => {
  console.log("\n=================================");
  console.log("🟡 SOFT-DELETE PRODUCT REQUEST");
  console.log("=================================");

  try {
    const { slug } = req.params;

    const cleanSlug = slug.toLowerCase().trim();

    console.log("📌 Marking product as Inactive:", cleanSlug);

    // =================================================
    // FIND PRODUCT
    // =================================================

    const product = await Product.findOne({
      slug: cleanSlug,
    });

    if (!product) {
      console.error("❌ Product not found:", cleanSlug);

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =================================================
    // UPDATE STATUS TO INACTIVE
    // =================================================

    product.status = "Inactive";

    await product.save();

    revalidateProductInBackground(product.slug);
    revalidateHomepageInBackground();

    return res.status(200).json({
      success: true,
      message: "Product status set to Inactive successfully",
      product,
    });
  } catch (error) {
    logFailure("SOFT-DELETE PRODUCT FAILED", error, {
      slug: req.params?.slug,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate product",
      error: error.message,
    });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 20 } = req.query;

    const query = {};

    // Filter by Status ("Active", "Out Of Stock", "Inactive")
    if (status && status !== "All") {
      query.status = status;
    }

    // Filter by Category
    if (category && category !== "All") {
      query.category = category;
    }

    // Search Filter (Regex match on name, productId, or slug)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { productId: searchRegex },
        { slug: searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products list.",
    });
  }
};

/**
 * @desc    Quick update product status
 * @route   PATCH /api/admin/product/status/:id
 * @access  Private/Admin
 */
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Out Of Stock", "Inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    revalidateProductInBackground(updatedProduct.slug);
    revalidateHomepageInBackground();

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();

    const product = await Product.findOne({ slug: cleanSlug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET ADMIN PRODUCT FAILED:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
      error: error.message,
    });
  }
};

export const getCatalogProducts = async (req, res) => {
  try {
    // Parse pagination
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 24, 1),
      100
    );

    // Seed is used to keep the catalog order consistent
    // while the user moves between pages.
    const seed =
      typeof req.query.seed === "string" && req.query.seed.trim()
        ? req.query.seed.trim()
        : "default";

    // Parse price filters
    const minPrice =
      req.query.minPrice !== undefined &&
      req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : null;

    const maxPrice =
      req.query.maxPrice !== undefined &&
      req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : null;

    // Validate prices
    if (
      (minPrice !== null && !Number.isFinite(minPrice)) ||
      (maxPrice !== null && !Number.isFinite(maxPrice))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price filter.",
      });
    }

    if (
      (minPrice !== null && minPrice < 0) ||
      (maxPrice !== null && maxPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative.",
      });
    }

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot be greater than maximum price.",
      });
    }

    // Build MongoDB filter
    const filter = {
      status: "Active",
    };

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};

      if (minPrice !== null) {
        filter.price.$gte = minPrice;
      }

      if (maxPrice !== null) {
        filter.price.$lte = maxPrice;
      }
    }

    // Fetch matching products.
    // No MongoDB $function is used here.
    const products = await Product.find(filter)
      .select({
        productId: 1,
        name: 1,
        slug: 1,
        description: 1,
        detailedDescription: 1,
        category: 1,
        gender: 1,
        images: 1,
        price: 1,
        comparePrice: 1,
        stock: 1,
        variations: 1,
        status: 1,
        featured: 1,
        views: 1,
        salesCount: 1,
        seo: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    // Deterministic hash.
    // Same seed + same product = same hash.
    // Different seed = different ordering.
    function seededHash(value) {
      let hash = 2166136261;

      for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);

        hash +=
          (hash << 1) +
          (hash << 4) +
          (hash << 7) +
          (hash << 8) +
          (hash << 24);
      }

      return hash >>> 0;
    }

    // Sort products using the seed.
    products.sort((a, b) => {
      const aKey = `${seed}:${a.productId || a._id}`;
      const bKey = `${seed}:${b.productId || b._id}`;

      const aHash = seededHash(aKey);
      const bHash = seededHash(bKey);

      if (aHash !== bHash) {
        return aHash - bHash;
      }

      // Fallback in the very unlikely event of a hash collision.
      return String(a._id).localeCompare(String(b._id));
    });

    // Total number of matching products
    const totalProducts = products.length;

    // Calculate total pages
    const totalPages =
      totalProducts === 0
        ? 1
        : Math.ceil(totalProducts / limit);

    // Prevent requesting a page beyond the last page
    const safePage = Math.min(page, totalPages);

    // Calculate slice indexes
    const startIndex = (safePage - 1) * limit;
    const endIndex = startIndex + limit;

    // Get products for requested page
    const paginatedProducts = products.slice(
      startIndex,
      endIndex
    );

    return res.status(200).json({
      success: true,

      products: paginatedProducts,

      pagination: {
        currentPage: safePage,
        totalPages,
        totalProducts,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    });
  } catch (error) {
    console.error("Catalog products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch catalog products.",
    });
  }
};
export const searchProducts = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 24, 1),
      48
    );

    // Empty search query
    if (!query) {
      return res.status(200).json({
        success: true,
        products: [],
        pagination: {
          currentPage: 1,
          perPage: limit,
          totalProducts: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        search: {
          query: "",
        },
      });
    }

    const match = {
      status: "Active",
      $text: {
        $search: query,
      },
    };

    // Count matching products
    const totalProducts = await Product.countDocuments(match);

    const totalPages = Math.ceil(totalProducts / limit);

    const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;

    const skip = totalPages > 0 ? (currentPage - 1) * limit : 0;

    const products = await Product.aggregate([
      {
        $match: match,
      },

      // MongoDB calculates relevance score
      {
        $addFields: {
          searchScore: {
            $meta: "textScore",
          },
        },
      },

      // Highest relevance first
      {
        $sort: {
          searchScore: -1,
          _id: 1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },

      // Don't send internal score to frontend
      {
        $project: {
          searchScore: 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      products,

      pagination: {
        currentPage,
        perPage: limit,
        totalProducts,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },

      search: {
        query,
      },
    });
  } catch (error) {
    console.error("Product search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
};


const TYPE_FILTERS = {
  "featured-articles": {
    featured: true,
  },

  "men-articles": {
    gender: {
      $in: ["Men", "Unisex", "ALL"],
    },
  },

  "women-articles": {
    gender: {
      $in: ["Women", "Unisex", "ALL"],
    },
  },

  "childrens-articles": {
    gender: {
      $in: ["Kids", "Unisex", "ALL"],
    },
  },

  "unisex-articles": {
    gender: {
      $in: ["Women", "Unisex", "Men"],
    },
  },
  "all-articles": {
    gender: {
      $in: ["Women", "Unisex", "Men", "ALL"],
    },
  },
};

export const getDynamicCollectionProducts = async (req, res) => {
  try {
    const { type, page = 1, limit = 24 } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Collection type is required",
      });
    }

    const normalizedType = type.trim().toLowerCase();

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const perPage = Math.min(
      Math.max(parseInt(limit, 10) || 24, 1),
      100
    );

    // Always require active products
    const filter = {
      status: "Active",
    };

    // Special collections
    if (TYPE_FILTERS[normalizedType]) {
      Object.assign(filter, TYPE_FILTERS[normalizedType]);
    } else {
      // Remove "-articles" from category URLs
      // Example:
      // luxury-watches-articles -> luxury-watches
      const categorySlug = normalizedType.replace(/-articles$/, "");

      // Convert slug back to category name
      // luxury-watches -> Luxury Watches
      const categoryName = categorySlug
        .split("-")
        .filter(Boolean)
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

      filter.category = new RegExp(
        `^${categoryName}$`,
        "i"
      );
    }

    console.log("Collection type:", normalizedType);
    console.log("Mongo filter:", filter);

    const totalProducts = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalProducts / perPage) || 0;

    const products = await Product.find(filter)
      .sort({
        featured: -1,
        createdAt: -1,
      })
      .skip((pageNumber - 1) * perPage)
      .limit(perPage)
      .lean();

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        perPage,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "getDynamicCollectionProducts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch collection products",
    });
  }
};

