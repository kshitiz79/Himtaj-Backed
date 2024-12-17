// src/deals/deal.route.js
const express = require("express");
const Deal = require("./deals.model");
const uploadImage = require("./../../utils/uploadimage");
const router = express.Router();

// Get current deal
router.get("/", async (req, res) => {
  try {
    const deal = await Deal.findOne();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/uploadImage", async (req, res) => {
  try {
    const { image } = req.body; // Expecting a base64 encoded image
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const imageUrl = await uploadImage(image); // Upload to Cloudinary
    res.status(200).json(imageUrl); // Respond with the secure URL
  } catch (error) {
    console.error("Error uploading image:", error.message);
    res.status(500).json({ message: "Failed to upload image" });
  }
});




// Update deal
router.put("/", async (req, res) => {
  try {
    const { title, description, discount, image, endDate } = req.body;
    let deal = await Deal.findOne();

    if (!deal) {
      deal = new Deal();
    }

    if (image) {
      const imageUrl = await uploadImage(image);
      deal.imageUrl = imageUrl;
    }

    deal.title = title;
    deal.description = description;
    deal.discount = discount;
    deal.endDate = new Date(endDate);

    await deal.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
