const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true }, // Cloudinary video URL
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For ordering banners
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Banner = mongoose.model("Banner", BannerSchema);

module.exports = Banner;