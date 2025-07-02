const Redis = require('ioredis');

// Create Redis client
const client = new Redis({
  port: parseInt(process.env.REDIS_PORT || '6379', 10), // Redis port
  host: process.env.REDIS_HOST || '127.0.0.1',           // Redis host
  username: process.env.REDIS_USERNAME || undefined,     // Optional
  password: process.env.REDIS_PASSWORD || undefined,     // Optional
  db: 0,
  maxRetriesPerRequest: null,  // ✅ set this to null as required by BullMQ                                                 // Optional: Redis DB index
});

// Log any Redis errors
client.on('error', err => {
  console.error('Redis Client Error:', err);
});

// Test connection
(async () => {
  try {
    await client.set('connection_test', 'working');
    const testResult = await client.get('connection_test');
    console.log('Redis test result:', testResult);
    console.log('Redis connected successfully');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

module.exports = client;
