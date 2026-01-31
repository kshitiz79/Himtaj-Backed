const mongoose = require("mongoose");

const DealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true },
  imageUrl: { type: String },
  endDate: { type: Date, required: true }
});

module.exports = mongoose.model("Deal", DealSchema);
