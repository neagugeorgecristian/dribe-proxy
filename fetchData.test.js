const fetchData = require('./proxy');
const axios = require('axios');
const NodeCache = require('node-cache');

jest.mock('axios');
jest.mock('node-cache');

describe('fetchData', () => {
  let mockedCache;

  beforeEach(() => {
    // Clear mock calls and create a new instance of NodeCache for each test
    jest.clearAllMocks();
    mockedCache = new NodeCache({ stdTTL: 60 });
    jest.spyOn(NodeCache.prototype, 'get').mockImplementation(mockedCache.get);
    jest.spyOn(NodeCache.prototype, 'set').mockImplementation(mockedCache.set);
  });


  it('should handle API fetch failure', async () => {
    // Ensure cache.get returns null to simulate data NOT available in cache
    mockedCache.get.mockReturnValue(null);

    // Set up the mocked API response to simulate a failure
    axios.get.mockRejectedValue(new Error('API fetch failed'));

    // Call the fetchData function and expect it to throw an error
    await expect(fetchData()).rejects.toThrow('Failed to fetch data from the API');

    // Assert that cache.set was not called because the API fetch failed
    expect(mockedCache.set).not.toHaveBeenCalled();
  });

    it('should return data from cache when available', async () => {
    // Set up the mocked data, this time AVAILABLE in the cache
    const cachedData = { key: 'cached-value' };
    mockedCache.get.mockReturnValue(cachedData);

    // Call the fetchData function
    const data = await fetchData();

    // Assert that the function returned the cached data
    expect(data).toEqual(cachedData);

    // Assert that cache.get was called with the correct key
    expect(mockedCache.get).toHaveBeenCalledWith('random-data');

    // Assert that the API was not called (since data is available in cache)
    expect(axios.get).not.toHaveBeenCalled();

    // Assert that cache.set was not called (since data is already in cache)
    expect(mockedCache.set).not.toHaveBeenCalled();
  });

});
