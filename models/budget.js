const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Budget", budgetSchema);
