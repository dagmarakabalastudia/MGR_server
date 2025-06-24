const axios = require("axios");
const crypto = require("crypto");

function randomString(size = 6) {
  return crypto.randomBytes(size).toString("hex").slice(0, size);
}

let budgetId = "65fd83d28882ea31ebed0683"; // Zakładamy, że to jest istniejący identyfikator budżetu
let categoryId = null;
let categoryData;

test("Create category", async () => {
  const newCategory = {
    budget: budgetId,
    name: `Category_${randomString()}`,
    color: "#FF5733",
    icon: "iconName",
    currentAmount: 100,
    moneyLimit: 500
  };

  try {
    const response = await axios.post("http://localhost:3000/categories", newCategory);
    expect(response.status).toBe(201);
    categoryId = response.data._id;
    categoryData = newCategory;
    console.log("Category created successfully:", categoryId);
  } catch (error) {
    console.error("Error creating category:", error.message);
    throw error;
  }
});

test("Get categories for budget", async () => {
  try {
    const response = await axios.get(`http://localhost:3000/categories/${budgetId}`);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: categoryId })]));
    console.log("Categories retrieved for budget:", budgetId);
  } catch (error) {
    console.error("Error retrieving categories for budget:", error.message);
    throw error;
  }
});

test("Get one category", async () => {
  try {
    const response = await axios.get(`http://localhost:3000/categories/category/${categoryId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('_id', categoryId);
    console.log("Category retrieved:", categoryId);
  } catch (error) {
    console.error("Error retrieving category:", error.message);
    throw error;
  }
});

test("Update category", async () => {
  const updatedCategoryData = { ...categoryData, name: `Updated_${randomString()}` };

  try {
    const response = await axios.put(`http://localhost:3000/categories/category/${categoryId}`, updatedCategoryData);
    expect(response.status).toBe(200);
    expect(response.data.name).toEqual(updatedCategoryData.name);
    console.log("Category updated successfully:", categoryId);
  } catch (error) {
    console.error("Error updating category:", error.message);
    throw error;
  }
});

test("Delete category", async () => {
  try {
    const response = await axios.delete(`http://localhost:3000/categories/category/${categoryId}`);
    expect(response.status).toBe(200);
    console.log("Category deleted successfully:", categoryId);
  } catch (error) {
    console.error("Error deleting category:", error.message);
    throw error;
  }
});