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
      return res.status(400).json({ error: "Błąd haseł" });
    }
    if (!username || !password || !name || !surname || !mail) {
      return res.status(400).json({ error: "Błąd danych" });
    }

    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Adres e-mail jest już użytkowany" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Nazwa użytkownika istnieje" });
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
    console.error("Błąd rejestracji", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    const fullUser = await User.findOne({ mail: req.body.mail });
    if (!fullUser) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    const passwordMatch = await bcrypt.compare(password, fullUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Złe dane logowania" });
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
    console.error("Błąd ładowania", error);
    res.status(500).json({ error: "Błąd serwera" });
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
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Błąd pobrania danych o użytkowniku", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.put("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const userData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });

    res.status(200).json({ message: "Dane zmienione", user: updatedUser });
  } catch (error) {
    console.error("Błąd edycji", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    res.status(200).json({ message: "Użytkownik usunięty", deletedUser });
  } catch (error) {
    console.error("Błąd usunięcia użytkownika", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
module.exports = router;
