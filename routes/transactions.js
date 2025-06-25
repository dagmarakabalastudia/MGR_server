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
      budgetExist.totalAmount -= parseFloat(productCost.toFixed(2));
      categoryExist.currentAmount -= parseFloat(productCost.toFixed(2));
    } else {
      budgetExist.totalAmount += parseFloat(productCost.toFixed(2));
      categoryExist.currentAmount += parseFloat(productCost.toFixed(2));
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
    budget,
  } = req.body;
  const budgetExist = await Budget.findById(budget);
  if (!budgetExist) {
    return res.status(400).json({ error: "Budżet nie istnieje." });
  }

  const categoryExist = await Category.findById(category);

  if (!categoryExist) {
    return res.status(400).json({ error: "Kategoria nie istnieje." });
  }
  const oldTransaction = await Transaction.findById(
    req.params.transactionId
  ).populate("category");
  if (category._id === oldTransaction.category._id) {
    if (isExpense) {
      budgetExist.totalAmount += parseFloat(
        (oldTransaction.productCost - productCost).toFixed(2)
      );
      categoryExist.currentAmount += parseFloat(
        (oldTransaction.productCost - productCost).toFixed(2)
      );
    } else {
      budgetExist.totalAmount -= parseFloat(
        (oldTransaction.productCost - productCost).toFixed(2)
      );
      categoryExist.currentAmount -= parseFloat(
        (oldTransaction.productCost - productCost).toFixed(2)
      );
    }
  } else {
    const oldCategoryExist = await Category.findById(category);

    if (isExpense) {
      budgetExist.totalAmount += parseFloat(
        (oldTransaction.productCost - productCost).toFixed(2)
      );
      oldCategoryExist.currentAmount += parseFloat(
        oldTransaction.productCost.toFixed(2)
      );
      categoryExist.currentAmount -= parseFloat(productCost.toFixed(2));
    } else {
      budgetExist.totalAmount -= parseFloat(
        (oldTransaction.productCost - productCost).toFixed(2)
      );
      oldCategoryExist.currentAmount -= parseFloat(
        oldTransaction.productCost.toFixed(2)
      );
      categoryExist.currentAmount += parseFloat(productCost.toFixed(2));
    }
    await oldCategoryExist.save();
  }
  await budgetExist.save();
  await categoryExist.save();
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

router.get("/anomalies/:budgetId", async (req, res) => {
  try {
    const budgetId = req.params.budgetId;

    const transactions = await Transaction.find({
      budget: budgetId,
      isExpense: true,
    }).populate("category", "name color icon");

    if (transactions.length < 2) {
      return res
        .status(400)
        .json({ error: "Za mało danych do wykrywania anomalii." });
    }

    function median(arr) {
      const sorted = arr.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }

    function mad(arr, med) {
      const deviations = arr.map((x) => Math.abs(x - med));
      return median(deviations);
    }

    const categoryGroups = {};

    for (const t of transactions) {
      const categoryId = t.category._id.toString();
      if (!categoryGroups[categoryId]) {
        categoryGroups[categoryId] = [];
      }
      categoryGroups[categoryId].push(t);
    }

    const anomalies = [];

    for (const group of Object.values(categoryGroups)) {
      const costs = group.map((t) => parseFloat(t.productCost));
      if (costs.length < 2) continue;

      const med = median(costs);
      const madVal = mad(costs, med);
      const scaledMad = madVal * 1.4826;
      const threshold = med + 3 * scaledMad;

      for (const t of group) {
        if (parseFloat(t.productCost) > threshold) {
          anomalies.push({
            _id: t._id,
            productName: t.productName,
            productCost: parseFloat(t.productCost),
            date: t.date,
            comment: t.comment,
            category: t.category,
            threshold,
            median: med,
            scaledMad,
          });
        }
      }
    }

    res.json(anomalies);
  } catch (error) {
    console.error("Błąd wykrywania anomalii:", error);
    res.status(500).json({ error: error.message });
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
