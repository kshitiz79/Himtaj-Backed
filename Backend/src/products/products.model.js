// models/products.model.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  image: { type: String, required: true },
  additionalImages: [{ type: String }],
  colors: [
    {
      value: String,
      code: String, // Save color code here
    },
  ],
  size: { type: String },
  gender: { type: String },
  metal: { type: String },

  rating: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isTrending: { type: Boolean, default: false },
}, { timestamps: true });

const Products = mongoose.model("Product", ProductSchema);


module.exports = Products;
