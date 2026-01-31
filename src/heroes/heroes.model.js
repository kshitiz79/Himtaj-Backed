const mongoose = require("mongoose");

const HeroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  images: [{ 
    type: String, 
    required: true 
  }], // Array of Cloudinary image URLs (max 4)
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For ordering heroes
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Validate that images array doesn't exceed 4 items
HeroSchema.pre('save', function(next) {
  if (this.images.length > 4) {
    const error = new Error('Maximum 4 images allowed');
    return next(error);
  }
  next();
});

const Hero = mongoose.model("Hero", HeroSchema);

module.exports = Hero;