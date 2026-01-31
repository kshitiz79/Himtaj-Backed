const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  amount: { type: Number, required: true },
  email: { type: String, required: true },
  paymentMethod: { type: String, enum: ["COD", "UPI"], required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "completed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
