const axios = require("axios");
const crypto = require("crypto");

function randomString(size = 6) {
  return crypto.randomBytes(size).toString("hex").slice(0, size);
}

let transactionId = null;
let transactionData;

const budgetId = "65fd83d28882ea31ebed0683"; // Zakładamy, że to jest istniejący identyfikator budżetu
const userId = "65fc62cd946a7d47b50df272"; // Zakładamy, że to jest istniejący identyfikator użytkownika
const categoryId = "65fdbd0d9771c75786664be7"; // Zakładamy, że to jest istniejący identyfikator kategorii

test("Create transaction", async () => {
  const newTransaction = {
    budget: budgetId,
    category: categoryId,
    user: userId,
    productName: `Product_${randomString()}`,
    productCost: 100,
    comment: "Test transaction",
    isExpense: true,
    date: new Date(),
    imagePath: ""
  };

  try {
    const response = await axios.post("http://localhost:3000/transactions", newTransaction);
    expect(response.status).toBe(201);
    transactionId = response.data._id;
    transactionData = newTransaction;
    console.log("Transaction created successfully:", transactionId);
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    throw error;
  }
});

test("Get transactions for budget", async () => {
  try {
    const response = await axios.get(`http://localhost:3000/transactions/budget/${budgetId}`);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
    console.log("Transactions retrieved for budget:", budgetId);
  } catch (error) {
    console.error("Error retrieving transactions for budget:", error.message);
    throw error;
  }
});

test("Get one transaction", async () => {
  try {
    const response = await axios.get(`http://localhost:3000/transactions/${transactionId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('_id', transactionId);
    console.log("Transaction retrieved:", transactionId);
  } catch (error) {
    console.error("Error retrieving transaction:", error.message);
    throw error;
  }
});

test("Update transaction", async () => {
  const updatedTransactionData = { ...transactionData, productName: `Updated_${randomString()}` };

  try {
    const response = await axios.put(`http://localhost:3000/transactions/${transactionId}`, updatedTransactionData);
    expect(response.status).toBe(200);
    expect(response.data.productName).toEqual(updatedTransactionData.productName);
    console.log("Transaction updated successfully:", transactionId);
  } catch (error) {
    console.error("Error updating transaction:", error.message);
    throw error;
  }
});

test("Delete transaction", async () => {
  try {
    const response = await axios.delete(`http://localhost:3000/transactions/${transactionId}`);
    expect(response.status).toBe(200);
    console.log("Transaction deleted successfully:", transactionId);
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    throw error;
  }
});