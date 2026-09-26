// models/productModel.js

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const productSchema = new mongoose.Schema(
  {
    // Unique Product ID
    productId: {
      type: String,
      unique: true,
      default: () => `PRD-${uuidv4().slice(0, 7).toUpperCase()}`,
    },

    // Basic Product Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    detailedDescription: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Unisex", "Kids", "All"],
      default: "Unisex",
    },

    // Product Images
    images: {
        type: [
          {
            url: {
              type: String,
              required: true,
              trim: true,
            },
            alt: {
              type: String,
              required: true,
              trim: true,
              maxlength: 150,
            },
          },
        ],
        required: true,
        validate: {
          validator: (images) => images.length > 0,
          message: "At least one product image is required",
        },
      },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    comparePrice: {
      type: Number,
      min: 0,
    },

    // Stock
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Optional Variations
    variations: {
      type: [
        {
          option: {
            type: String,
            trim: true,
          },

          values: [
            {
              value: {
                type: String,
                trim: true,
              },
              stock: {
                type: Number,
                default: 0,
                min: 0,
              },
            },
          ],
        },
      ],
      default: [],
    },

    // Product Status
    status: {
      type: String,
      enum: ["Active", "Out Of Stock", "Inactive"],
      default: "Active",
    },

    // Featured Product
    featured: {
      type: Boolean,
      default: false,
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },

    salesCount: {
      type: Number,
      default: 0,
    },

    // SEO
    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 70,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 160,
      },

      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    collection: "Product",
  }
);


// Search / Filter Index
productSchema.index({
  status: 1,
  category: 1,
});


// Text Search Index
productSchema.index(
  {
    name: "text",
    description: "text",
    detailedDescription: "text",
    category: "text",
  },
  {
    weights: {
      name: 5,
      category: 3,
      description: 2,
      detailedDescription: 1,
    },
  }
);


// Homepage / Sorting Index
productSchema.index({
  status: 1,
  featured: 1,
  views: -1,
  salesCount: -1,
  createdAt: -1,
});


export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);