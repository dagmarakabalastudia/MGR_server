var express = require("express");
var router = express.Router();
const Category = require("../models/category");

router.post("/", async (req, res) => {
  const { budget, name, color, icon, currentAmount, moneyLimit } = req.body;
  try {
    const newCategory = new Category({
      budget,
      name,
      color,
      icon,
      currentAmount,
      moneyLimit,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/budget/:budgetId", async (req, res) => {
  try {
    const categories = await Category.find({ budget: req.params.budgetId });
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:categoryId", async (req, res) => {
  const { name, color, icon, currentAmount, moneyLimit } = req.body;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { name, color, icon, currentAmount, moneyLimit },
      { new: true }
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/category/:categoryId", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: "Category successfully deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/category/:categoryId", async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
