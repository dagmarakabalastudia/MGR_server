const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productName: { type: String, required: true },
  productCost: { type: Number, required: true },
  comment: { type: String },
  isExpense: { type: Boolean },
  date: { type: Date, default: Date.now },
  imagePath: String,
});

module.exports = mongoose.model("Transaction", transactionSchema);
