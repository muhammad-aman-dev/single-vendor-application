import mongoose from "mongoose";

const carouselSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Untitled Banner",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    redirectUrl: {
      type: String,
      trim: true,
      default: "/",
    },
  },
  { timestamps: true }
);

const Carousel = mongoose.models.Carousel || mongoose.model("Carousel", carouselSchema);
export default Carousel;