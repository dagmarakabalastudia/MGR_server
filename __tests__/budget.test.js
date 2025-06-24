const axios = require("axios");
const crypto = require("crypto");

function randomString(size = 6) {
  return crypto.randomBytes(size).toString("hex").slice(0, size);
}

let budgetId = null;
let budgetData;

test("Create budget", async () => {
  const newBudget = {
    owner: "65fc62cd946a7d47b50df272",
    name: `Budget_${randomString()}`,
    totalAmount: 1000,
    participants: [],
  };

  try {
    const response = await axios.post(
      "http://localhost:3000/budgets",
      newBudget
    );
    expect(response.status).toBe(200);
    budgetId = response.data._id;
    budgetData = newBudget;
  } catch (error) {
    console.error("Error creating budget:", error.message);
    throw error;
  }
});

test("Get budgets for user", async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/budgets?userId=${budgetData.owner}`
    );
    expect(response.status).toBe(200);
    expect(
      response.data.some((budget) => budget._id === budgetId)
    ).toBeTruthy();
  } catch (error) {
    console.error("Error retrieving budgets:", error.message);
    throw error;
  }
});

test("Get one budget", async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/budgets/${budgetId}`
    );
    expect(response.status).toBe(200);
    expect(response.data.budget).toHaveProperty("name", budgetData.name);
  } catch (error) {
    console.error("Error retrieving budget:", error.message);
    throw error;
  }
});

test("Add participant to budget", async () => {
  const newParticipantId = "65fc3889fac27f77b2cbb717";

  try {
    const response = await axios.post(
      `http://localhost:3000/budgets/${budgetId}/participants`,
      { userId: newParticipantId }
    );
    expect(response.status).toBe(200);
    // Przekształć odpowiedź, aby uzyskać tablicę identyfikatorów uczestników
    const participantIds = response.data.participants.map(
      (participant) => participant._id
    );
    // Sprawdź, czy nowy identyfikator uczestnika znajduje się wśród zwróconych identyfikatorów
    expect(participantIds).toContain(newParticipantId);
    console.log("Participant added successfully:", newParticipantId);
  } catch (error) {
    console.error("Error adding participant:", error.message);
    throw error;
  }
});
test("Remove participant from budget", async () => {
  const participantIdToRemove = "65fc3889fac27f77b2cbb717";

  try {
    const response = await axios.put(
      `http://localhost:3000/budgets/${budgetId}/participants/remove`,
      { participantId: participantIdToRemove }
    );
    expect(response.status).toBe(200);
    // Zakładając, że odpowiedź serwera zawiera bezpośrednio zaktualizowaną listę uczestników
    expect(response.data.participants).not.toContain(participantIdToRemove);
    console.log("Participant removed successfully:", participantIdToRemove);
  } catch (error) {
    console.error("Error removing participant:", error.message);
    throw error;
  }
});

test("Delete budget", async () => {
  try {
    const response = await axios.delete(
      `http://localhost:3000/budgets/${budgetId}`
    );
    expect(response.status).toBe(200);
    console.log("Budget deleted successfully:", budgetId);
  } catch (error) {
    console.error("Error deleting budget:", error.message);
    throw error;
  }
});
