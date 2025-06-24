const axios = require('axios');

test('Fetch users list', async () => {
  try {
    const response = await axios.get('http://localhost:3000/users/userslist');
    expect(response.status).toBe(200); // Check if the response status is 200 (OK)
    // console.log('Users list:', response.data);
  } catch (error) {
    console.error('Error fetching users list:', error.message);
    throw error;
  }
});