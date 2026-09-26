import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
      default: () => `ORD-${uuidv4().slice(0, 7).toUpperCase()}`,
    },

    idempotencyKey: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          variations: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
          image: {
            type: String,
            default: null,
          },
        },
      ],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
        default: "",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentVerification: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "packaging",
        "shipped",
        "delivered",
        "received",
        "cancelled",
      ],
      default: "packaging",
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
    },

    codFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    fee: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    refundRequested: {
      type: Boolean,
      default: false,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    stockRestored: {
      type: Boolean,
      default: false,
    },

    refundReason: {
      type: String,
      default: "",
      trim: true,
    },

    refundStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "approved",
        "rejected",
        "processed",
      ],
      default: "none",
    },

    refundNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentVerification: 1 });

export default mongoose.model("Order", orderSchema);