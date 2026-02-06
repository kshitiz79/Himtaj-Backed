const express = require("express");
const Products = require("./products.model");
const Reviews = require("../reviews/reviews.model");
const router = express.Router();
const mongoose = require("mongoose");

// Create a new product
router.post("/create-product", async (req, res) => {
  try {
    const { author } = req.body;

    // Validate author ObjectId
    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({ message: "Invalid author ID" });
    }

    const newProduct = new Products(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
});
// Search products by name or description
router.get("/search", async (req, res) => {
  const { query } = req.query;

  try {
    const regex = new RegExp(query, "i");
    const products = await Products.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Error searching products" });
  }
});






// Fetch all products with filters and pagination
router.get("/", async (req, res) => {
  try {
    const {
      gender,
      category,
      color,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "createdAt",    // default sorting field
      sortOrder = "desc",      // default sorting order: 'asc' or 'desc'
    } = req.query;

    const filter = {};

    // 1. Gender filter
    if (gender) {
      const validGenders = ["male", "female"];
      if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
          message: "Invalid gender. Use 'male' or 'female'.",
        });
      }
      filter.gender = gender.toLowerCase();
    }

    // 2. Category filter
    if (category) {
      filter.category = category;
    }
    if (color) {
      filter["colors.value"] = color;
    }

    if (minPrice) {
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const sortObj = { [sortBy]: sortDirection };
    const products = await Products.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .allowDiskUse();
    const totalProducts = await Products.countDocuments(filter);

    res.status(200).json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});







// Fetch trending products
router.get("/trending", async (_req, res) => {
  try {
    const trendingProducts = await Products.find({ isTrending: true })
      .sort({ createdAt: -1 }) // Sort by latest uploaded first (-1 for descending order)
      .select('name createdAt isTrending')
      .allowDiskUse(); // Add select to see the fields for debugging

    console.log("Trending products fetched:", trendingProducts.map(p => ({
      name: p.name,
      createdAt: p.createdAt,
      isTrending: p.isTrending
    })));

    // Remove select for actual response
    const fullTrendingProducts = await Products.find({ isTrending: true })
      .sort({ createdAt: -1 })
      .allowDiskUse();

    res.status(200).json(fullTrendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ message: "Error fetching trending products" });
  }
});

// Fetch a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Products.findById(productId).populate("author", "email username");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Reviews.find({ productId }).populate("userId", "username email");

    res.status(200).json({ product, reviews });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Update a product by ID
router.patch("/update-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Delete a product by ID
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Products.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Reviews.deleteMany({ productId });

    res.status(200).json({ message: "Product and associated reviews deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});


// Fetch related products
router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const titleRegex = new RegExp(
      product.name.split(" ").filter(word => word.length > 1).join("|"),
      "i"
    );

    const relatedProducts = await Products.find({
      _id: { $ne: id },
      $or: [
        { name: { $regex: titleRegex } },
        { category: product.category },
      ],
    });

    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Failed to fetch related products" });
  }
});

module.exports = router;
