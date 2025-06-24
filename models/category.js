const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true },
  name: { type: String, required: true },
  color: { type: String },
  icon: { type: String },
  currentAmount: { type: Number, required: true  },
  moneyLimit: { type: Number, required: true }
});

module.exports = mongoose.model('Category', categorySchema);