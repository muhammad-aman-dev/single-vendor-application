import Category from "../models/Category.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinaryUploader.js";
import { revalidateCollectionsInBackground } from "../lib/revalidateFunc.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Category collection image is required.",
      });
    }

    const trimmedName = name.trim();

    // Check for existing category (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    // Upload image to Cloudinary (in a 'categories' folder)
    const imageUrl = await uploadToCloudinary(imageFile.path, "categories");

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload category image to Cloudinary.",
      });
    }

    const category = await Category.create({ 
      name: trimmedName, 
      image: imageUrl 
    });

    revalidateCollectionsInBackground();

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding category.",
    });
  }
};

/**
* @desc    Remove a category (Minimum 4 categories must remain) & delete its image from Cloudinary
* @route   DELETE /api/admin/product/category/delete/:id
*/
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if total categories are 4 or fewer
    const totalCategories = await Category.countDocuments();

    if (totalCategories <= 4) {
      return res.status(400).json({
        success: false,
        message: `Deletion denied. At least 4 categories must remain in the database. (Current total: ${totalCategories})`,
      });
    }

    const categoryToDelete = await Category.findById(id);

    if (!categoryToDelete) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Delete image from Cloudinary if it exists
    if (categoryToDelete.image) {
      await deleteFromCloudinary(categoryToDelete.image);
    }

    await Category.findByIdAndDelete(id);

    revalidateCollectionsInBackground();

    return res.status(200).json({
      success: true,
      message: `Category '${categoryToDelete.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing category.",
    });
  }
};
  
  /**
   * @desc    Get all categories
   * @route   GET /api/admin/category/all
   */
  export const getAllCategories = async (req, res) => {
    try {
      const categories = await Category.find({}).sort({ createdAt: -1 });
  
      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching categories.",
      });
    }
  };