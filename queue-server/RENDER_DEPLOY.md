# Deploying Queue Server on Render

This guide explains how to deploy the queue server on Render and connect it to a Redis instance.

## Step 1: Create a Redis Instance

You have several options for Redis:

1. **Render Redis Service** (Recommended for Render deployments)

   - Go to your Render dashboard
   - Click "New" and select "Redis"
   - Follow the setup instructions
   - Once created, Render will provide you with a Redis URL
   - Copy the Internal URL for use in your queue-server

2. **Upstash Redis**

   - Go to [upstash.com](https://upstash.com/)
   - Create a free Redis database
   - Get the Redis connection URL

3. **Redis Cloud**
   - Go to [redis.com](https://redis.com/)
   - Sign up for a free account
   - Create a database and get the connection URL

## Step 2: Deploy the Queue Server

1. In your Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: `queue-server`
   - Root Directory: `queue-server` (if your repo has multiple services)
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node index.js`

## Step 3: Configure Environment Variables

In your queue server's Render dashboard, go to "Environment" and add these variables:

```
NODE_ENV=production
REDIS_URL=your-redis-connection-url
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=Feedback App <your-email@example.com>
MONGODB_URI=your-mongodb-connection-url
```

Replace the placeholder values with your actual configuration.

> **Important Note**: For Redis v5 client, your REDIS_URL should be in this format:
> `redis://username:password@hostname:port`
>
> If you have no username and password, use:
> `redis://hostname:port`

## Step 4: Deploy and Test

1. Deploy your service
2. Check the logs for any connection errors
3. Test the service by sending a request to your API endpoints

## Troubleshooting

If you see Redis connection errors:

1. Verify your REDIS_URL is correct and in the proper format for node-redis v5
2. Check if your Redis service is running
3. Ensure your Redis service allows connections from your queue server
4. If using a free Redis service, check connection limits

For more detailed logs, you can temporarily add this to your code:

```javascript
// Add to redis-config.js
console.log("REDIS_URL:", process.env.REDIS_URL);
```

## Important Notes

- Free Redis services may have connection limits
- Ensure your Redis service is in the same region as your queue server for better performance
- For production, consider using a paid Redis service for reliability
- The node-redis v5 client uses a different connection syntax than previous versions
