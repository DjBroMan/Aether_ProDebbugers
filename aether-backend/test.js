const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/dashboard/faculty', {
      headers: {
        Authorization: 'Bearer MOCK_TOKEN',
        'x-mock-role': 'FACULTY'
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data);
  }
}

test();
