import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
  
      fee: {
        type: Number,
        required: true,
        min: 0,
      },
  
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );
  
  // Only one shipping method/config can be active
  shippingSchema.index(
    { isActive: 1 },
    {
      unique: true,
      partialFilterExpression: { isActive: true },
    }
  );
  
  const Shipping = mongoose.model("Shipping", shippingSchema);
  
  export default Shipping;