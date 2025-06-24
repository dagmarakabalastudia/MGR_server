const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const corsOptions = {
  origin: process.env.HOST_ORIGIN,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors(corsOptions));
app.options("*", cors());
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const budgetRouter = require("./routes/budgets");
const categoriesRouter = require("./routes/categories");
const transactionsRouter = require("./routes/transactions");

// ruty
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/budgets", budgetRouter);
app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);

module.exports = app;
