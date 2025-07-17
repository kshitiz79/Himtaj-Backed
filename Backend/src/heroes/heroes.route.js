const express = require("express");
const Hero = require("./heroes.model");
const router = express.Router();
const mongoose = require("mongoose");

// Create a new hero
router.post("/create-hero", async (req, res) => {
  try {
    const { author, images } = req.body;

    // Validate author ObjectId
    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({ message: "Invalid author ID" });
    }

    // Validate images array length
    if (images && images.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    const newHero = new Hero(req.body);
    const savedHero = await newHero.save();
    res.status(201).json(savedHero);
  } catch (error) {
    console.error("Error creating hero:", error);
    res.status(500).json({ message: "Failed to create hero", error: error.message });
  }
});

// Fetch all heroes
router.get("/", async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const heroes = await Hero.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate("author", "email username");
    
    res.status(200).json(heroes);
  } catch (error) {
    console.error("Error fetching heroes:", error);
    res.status(500).json({ message: "Error fetching heroes" });
  }
});

// Fetch a single hero by ID
router.get("/:id", async (req, res) => {
  try {
    const heroId = req.params.id;
    const hero = await Hero.findById(heroId).populate("author", "email username");

    if (!hero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.status(200).json(hero);
  } catch (error) {
    console.error("Error fetching hero:", error);
    res.status(500).json({ message: "Failed to fetch hero" });
  }
});

// Update a hero by ID
router.patch("/update-hero/:id", async (req, res) => {
  try {
    const heroId = req.params.id;
    const { images } = req.body;

    // Validate images array length if provided
    if (images && images.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    const updatedHero = await Hero.findByIdAndUpdate(
      heroId,
      { ...req.body },
      { new: true }
    );

    if (!updatedHero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.status(200).json({ message: "Hero updated successfully", hero: updatedHero });
  } catch (error) {
    console.error("Error updating hero:", error);
    res.status(500).json({ message: "Failed to update hero" });
  }
});

// Delete a hero by ID
router.delete("/:id", async (req, res) => {
  try {
    const heroId = req.params.id;
    const deletedHero = await Hero.findByIdAndDelete(heroId);

    if (!deletedHero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    res.status(200).json({ message: "Hero deleted successfully" });
  } catch (error) {
    console.error("Error deleting hero:", error);
    res.status(500).json({ message: "Failed to delete hero" });
  }
});

module.exports = router;