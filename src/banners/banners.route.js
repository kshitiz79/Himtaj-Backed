const express = require("express");
const Banner = require("./banners.model");
const router = express.Router();
const mongoose = require("mongoose");

// Create a new banner
router.post("/create-banner", async (req, res) => {
  try {
    const { author } = req.body;

    // Validate author ObjectId
    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({ message: "Invalid author ID" });
    }

    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Failed to create banner", error: error.message });
  }
});

// Fetch all banners
router.get("/", async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate("author", "email username");
    
    res.status(200).json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Error fetching banners" });
  }
});

// Fetch a single banner by ID
router.get("/:id", async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findById(bannerId).populate("author", "email username");

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// Update a banner by ID
router.patch("/update-banner/:id", async (req, res) => {
  try {
    const bannerId = req.params.id;
    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      { ...req.body },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner updated successfully", banner: updatedBanner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

// Delete a banner by ID
router.delete("/:id", async (req, res) => {
  try {
    const bannerId = req.params.id;
    const deletedBanner = await Banner.findByIdAndDelete(bannerId);

    if (!deletedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ message: "Failed to delete banner" });
  }
});

module.exports = router;