var express = require("express");
var router = express.Router();
const Category = require("../models/category");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");

router.post("/", async (req, res) => {
  const {
    budget,
    category,
    user,
    productName,
    productCost,
    comment,
    isExpense,
    date,
    imagePath,
  } = req.body;

  const budgetExist = await Budget.findById(budget);
  if (!budgetExist) {
    return res.status(400).json({ error: "Budżet nie istnieje." });
  }

  const categoryExist = await Category.findById(category);

  if (!categoryExist) {
    return res.status(400).json({ error: "Kategoria nie istnieje." });
  }

  try {
    const newTransaction = new Transaction({
      budget,
      category,
      user,
      productName,
      productCost,
      comment,
      isExpense,
      date,
      imagePath,
    });

    const savedTransaction = await newTransaction.save();

    if (isExpense) {
      budgetExist.totalAmount -= parseFloat(productCost);
      categoryExist.currentAmount -= parseFloat(productCost);
    } else {
      budgetExist.totalAmount += parseFloat(productCost);
      categoryExist.currentAmount += parseFloat(productCost);
    }
    await budgetExist.save();
    await categoryExist.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Błąd podczas zapisu transakcji:", error);
    res.status(400).json({ error: error.message });
  }
});
router.get("/budget/:budgetId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      budget: req.params.budgetId,
    }).populate("category user", "name color icon mail");
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:transactionId", async (req, res) => {
  try {
    const transaction = await Transaction.findById(
      req.params.transactionId
    ).populate("category user", "name color icon mail");
    if (!transaction) {
      return res.status(404).json({ message: "Transakcja nie znaleziona" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:transactionId", async (req, res) => {
  const {
    category,
    productName,
    productCost,
    comment,
    isExpense,
    date,
    imagePath,
  } = req.body;

  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      {
        category,
        productName,
        productCost,
        comment,
        isExpense,
        date,
        imagePath,
      },
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:transactionId", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.transactionId);
    res.json({ message: "Transakcja pomyślnie usunięta" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
