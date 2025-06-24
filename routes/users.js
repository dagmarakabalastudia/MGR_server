// routes/users.js
var express = require("express");
var router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { username, password, confirmPassword, name, surname, mail } =
      req.body;
    if (confirmPassword !== password) {
      return res.status(400).json({ error: "Password don't match" });
    }
    if (!username || !password || !name || !surname || !mail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({ error: "Mail already exists" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      mail,
      username,
      password: hashedPassword,
      name,
      surname,
    });

    const savedUser = await newUser.save();
    res.setHeader("Content-Type", "application/json");

    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    const user = {
      username: savedUser.username,
      name: savedUser.name,
      surname: savedUser.surname,
      mail: savedUser.mail,
      id: savedUser._id,
    };
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const fullUser = await User.findOne({ mail: req.body.mail });
    if (!fullUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = true;
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: fullUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.setHeader("Content-Type", "application/json");
    const user = {
      username: fullUser.username,
      name: fullUser.name,
      surname: fullUser.surname,
      mail: fullUser.mail,
      id: fullUser._id,
    };
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/userslist", (req, res) => {
  User.find({}, "-password")
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(500).json(err));
});
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const userData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
