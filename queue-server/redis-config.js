const redisOptions = {};

// First check if REDIS_URL is provided (for hosted Redis services)
if (process.env.REDIS_URL) {
  redisOptions.url = process.env.REDIS_URL;
} else {
  // Fall back to individual connection parameters
  redisOptions.socket = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
  
  // Optional credentials
  if (process.env.REDIS_USERNAME) {
    redisOptions.username = process.env.REDIS_USERNAME;
  }
  if (process.env.REDIS_PASSWORD) {
    redisOptions.password = process.env.REDIS_PASSWORD;
  }
}

module.exports = redisOptions;
