const axios = require("axios");
const crypto = require("crypto");

// Function to generate a random string
function randomString(size = 6) {
  return crypto.randomBytes(size).toString("hex").slice(0, size);
}
let userId = null;
let userData;
test("Create user", async () => {
  // Create a new user
  const newUser = {
    username: `user_126123456`,
    password: "test",
    name: "test",
    surname: "test",
    mail: `testMail2@example.com`,
  };

  try {
    const response = await axios.post("http://localhost:3000/users", newUser);
    expect(response.status).toBe(201); // Check if the response status is 201 (Created)
    userId = response.data;
    console.log("response.data")
    console.log(response.data)
    userData = newUser;
    console.log("User created successfully:", response.data);
  } catch (error) {
    console.log("Error creating user:", error.message);
    throw error;
  }
});

test("Get user by ID", async () => {
  try {
    // Pobierz użytkownika na podstawie jego ID
    const getUserResponse = await axios.get(
      `http://localhost:3000/users/${userId}`
    );
    console.log(userId)
    expect(getUserResponse.status).toBe(200); // Sprawdź, czy status odpowiedzi to 200 (OK)

    // Sprawdź, czy pobrany użytkownik ma oczekiwane właściwości
    const user = getUserResponse.data.user;
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("username", userData.username);
    expect(user).toHaveProperty("name", userData.name);
    expect(user).toHaveProperty("surname", userData.surname);
    expect(user).toHaveProperty("mail", userData.mail);

    console.log("User retrieved successfully:", user);
  } catch (error) {
    console.error("Error getting user:", error.message);
    throw error;
  }
});

test("User login", async () => {
  const userData = {
    mail: "testMail2@example.com", // Ustaw nazwę użytkownika, który istnieje w bazie danych
    password: "test", // Ustaw prawidłowe hasło dla powyższego użytkownika
  };

  try {
    // Send login request
    const response = await axios.post(
      "http://localhost:3000/users/login",
      userData
    );
    // Check response status and data
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("user");
    expect(response.data).toHaveProperty("token");

    console.log("User logged in successfully:", response.data.user);
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
});

test("Put data to user", async () => {
  try {
    // Dane do aktualizacji użytkownika
    const updatedUserData = {
      name: "newName",
      surname: "newSurname",
    };

    // Aktualizuj użytkownika
    const updateUserResponse = await axios.put(
      `http://localhost:3000/users/${userId}`,
      updatedUserData
    );
    expect(updateUserResponse.status).toBe(200);

    // Pobierz użytkownika, aby sprawdzić, czy dane zostały zaktualizowane
    const getUserResponse = await axios.get(
      `http://localhost:3000/users/${userId}`
    );
    const updatedUser = getUserResponse.data.user;

    // Sprawdź, czy dane użytkownika zostały zaktualizowane poprawnie
    expect(updatedUser.name).toBe(updatedUserData.name);
    expect(updatedUser.surname).toBe(updatedUserData.surname);

    console.log("User updated successfully:", updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    throw error;
  }
});

test("Delete user", async () => {
  try {
    console.log(userId);
    // Delete the user
    const deleteResponse = await axios.delete(
      `http://localhost:3000/users/${userId}`
    );
    expect(deleteResponse.status).toBe(200);
    console.log("User deleted successfully");
  } catch (error) {
    console.log("Error deleting user:", error.message);
    throw error;
  }
});
