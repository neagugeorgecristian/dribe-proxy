const express = require('express'); // Creating the web server
const axios = require('axios'); // For the HTTP requests
const NodeCache = require('node-cache'); // Caching

const app = express();
const apiUrl = 'https://random-data-api.com/api/v2/beers?size=3';
const cache = new NodeCache({ stdTTL: 60 }); // Cache with a 1-minute expiration time (60 seconds)

// Function to fetch data from the API or cache
async function fetchData() {
  const cachedData = cache.get('random-data');
  
  // If data is still cached, return it
  if (cachedData) {
    console.log('Data served from cache');
    return cachedData;
  } else {
    try {
      const response = await axios.get(apiUrl);
      cache.set('random-data', response.data);
      console.log('Data served from API');
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      throw new Error('Failed to fetch data from the API');
    }
  }
}

// Custom error handling middleware due to getting 404 when testing
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
}

// Proxy endpoint to fetch random data from the API
app.get('/random-data', async (req, res, next) => {
  try {
    const data = await fetchData();

    // Ensure the response is sent only once
    res.on('finish', () => {
      console.log('Response sent to client');
    });

    res.json(data);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Register the custom error handling middleware
app.use(errorHandler);

// Start the server on port 3000 (you can change the port if needed)
app.listen(3000, () => {
  console.log('Proxy server is running on http://localhost:3000');
});
