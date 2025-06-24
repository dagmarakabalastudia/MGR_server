var express = require("express");
var router = express.Router();
const Budget = require("../models/budget");
const User = require("../models/user");

router.post("/", (req, res) => {
  const newBudget = new Budget({
    owner: req.body.owner,
    name: req.body.name,
    totalAmount: req.body.totalAmount,
    participants: req.body.participants,
  });

  newBudget
    .save()
    .then((budget) => res.json(budget))
    .catch((err) => res.status(400).json(err));
});

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(404).json({ message: "Nie znaleziono użytkownika" });
  }
  Budget.find({ $or: [{ owner: userId }, { participants: userId }] })
    .populate("owner", ["username", "mail"])
    .populate("participants", ["username", "mail"])
    .then((budgets) => res.json(budgets))
    .catch((err) => res.status(400).json(err));
});

router.get("/:budgetId", async (req, res) => {
  const budgetId = req.params.budgetId;

  try {
    const budget = await Budget.findById(budgetId)
      .populate("owner", ["username", "mail"])
      .populate("participants", ["username", "mail"]);

    if (!budget) {
      return res.status(404).json({ error: "Nie znaleziono budżetu" });
    }

    res.status(200).json({ budget });
  } catch (error) {
    console.error("Error getting budget:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", (req, res) => {
  Budget.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((budget) => res.json(budget))
    .catch((err) => res.status(400).json(err));
});

router.delete("/:budgetId", async (req, res) => {
  const budgetId = req.params.budgetId;
  try {
    const deletedBudget = await Budget.findByIdAndDelete(budgetId);

    if (!deletedBudget) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    res
      .status(200)
      .json({ message: "Budżet usunięto pomyślnie", deletedBudget });
  } catch (error) {
    console.error("Błąd usunięcia budżetu:", error);
    res.status(500).json({ error: "Wewnętrzy błąd" });
  }
});

router.post("/:budgetId/participants", async (req, res) => {
  const { budgetId } = req.params;
  const { userEmail } = req.body;

  try {
    const user = await User.findOne({ mail: userEmail });

    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      budgetId,
      { $addToSet: { participants: user._id } },
      { new: true }
    ).populate("participants", ["name", "mail"]);

    if (!updatedBudget) {
      return res.status(404).json({ message: "Nie znaleziono budżetu" });
    }

    res.json(updatedBudget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.put("/:budgetId/participants/remove", (req, res) => {
  const budgetId = req.params.budgetId;
  const participantId = req.body.participantId;

  Budget.findByIdAndUpdate(
    budgetId,
    { $pull: { participants: participantId } },
    { new: true, runValidators: true }
  )
    .populate("participants", ["name"])
    .then((updatedBudget) => res.json(updatedBudget))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
