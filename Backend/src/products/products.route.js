const express = require("express");
const Products = require("./products.model");
const Reviews = require("../reviews/reviews.model");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();





router.post("/create-product", async (req, res) => {
  try {
    const { name } = req.body;

    const newProduct = new Products({
      ...req.body,
    });

    const savedProduct = await newProduct.save();

    const reviews = await Reviews.find({ productId: savedProduct._id });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );

      const averageRating = totalRating / reviews.length;
      savedProduct.rating = averageRating;
      await savedProduct.save();
    }

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});






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
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error searching products" });
  }
});






router.get("/", async (req, res) => {
  try {
    const { category, color, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Apply category filter only if provided
    if (category) {
      filter.category = category;
    }

    // Apply color filter only if provided
    if (color) {
      filter.color = color;
    }

    // Apply price filter only if both minPrice and maxPrice are valid
    if (minPrice !== undefined && minPrice !== '' && !isNaN(parseFloat(minPrice))) {
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(parseFloat(maxPrice))) {
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }

    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (pageNumber - 1) * itemsPerPage;

    const products = await Products.find(filter).skip(skip).limit(itemsPerPage).exec();
    const totalProducts = await Products.countDocuments(filter);

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    res.status(200).json({
      products,
      totalProducts,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});




router.get("/trending", async (req, res) => {
  try {
    const trendingProducts = await Products.find({ isTrending: true });
    res.status(200).json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ message: "Error fetching trending products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Products.findById(productId).populate(
      "author",
      "email username"
    );

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    const reviews = await Reviews.find({ productId }).populate(
      "userId",
      "username email"
    );

    res.status(200).send({ product, reviews });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send({ message: "Failed to fetch post" });
  }
});








router.patch("/update-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    // const { title, content, category } = req.body;
    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send({ message: "Product not found" });
    }

    res
      .status(200)
      .send({
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send({ message: "Failed to fetch product" });
  }
});









router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Products.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).send({ message: "Post not found" });
    }

    await Reviews.deleteMany({ productId: productId });

    res.status(200).send({
      message: "Product and associated comments deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send({ message: "Failed to delete post" });
  }
});








router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "Product ID is required" });
    }

    const product = await Products.findById(id);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    const titleRegex = new RegExp(
      product.name
        .split(" ")
        .filter((word) => word.length > 1)
        .join("|"),
      "i"
    );

    const relatedProducts = await Products.find({
      _id: { $ne: id },
      $or: [
        { name: { $regex: titleRegex } },
        { category: product.category },
      ],
    });

    res.status(200).send(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).send({ message: "Failed to fetch related products" });
  }
});

module.exports = router;
