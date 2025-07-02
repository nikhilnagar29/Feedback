# Feedback Application

A modern feedback collection and processing system built with Next.js, MongoDB, Redis, and BullMQ.

![Feedback App](https://img.shields.io/badge/Feedback%20App-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Overview

This application provides a complete feedback system with:

- User authentication and verification
- Real-time feedback submission and collection
- Asynchronous processing of messages and notifications
- High-performance queue management for email delivery
- Containerized deployment with Docker

## 🏗️ Architecture

The project consists of two main components:

1. **Next.js Web Application** (`/feedback`)

   - Frontend UI built with React and Next.js
   - Backend API routes for handling requests
   - MongoDB integration for data persistence
   - Authentication system with email verification
   - Local buffering for service resilience

2. **Queue Processing Server** (`/queue-server`)
   - Built with Express.js
   - BullMQ for high-performance job queuing
   - Redis for queue storage and caching
   - Email delivery service with retries and error handling
   - Message processing capabilities

### Microservices Benefits

This microservices-style architecture provides several key advantages:

- **Reduced System Dependency:** Decreases main system dependency by ~20% through service isolation
- **Fault Isolation:** Component failures are contained within service boundaries
- **Independent Scaling:** Services can be scaled based on individual requirements
- **Simplified Maintenance:** Services can be updated independently
- **Enhanced Resilience:** System continues functioning during partial outages

## 🚀 Performance

The system is optimized for high throughput:

- Handles 200+ concurrent OTP and messaging requests
- 100% delivery rate in load testing
- Average response time of ~145ms under load
- Efficient queue processing with BullMQ workers
- Horizontal scaling capability with Docker Compose
- Continues functioning during queue service outages

## 🛠️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) v14+ (for local development)
- [MongoDB](https://www.mongodb.com/) (automatically configured in Docker)
- [Redis](https://redis.io/) (automatically configured in Docker)

## 🔧 Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/feedback-app.git
   cd feedback-app
   ```

2. **Feedback App Setup**

   ```bash
   cp feedback/env.example feedback/.env.local
   ```

3. **Queue Server Setup**

   ```bash
   cp queue-server/env.example queue-server/.env
   ```

4. **Update Email Settings**

   Edit the `docker-compose.yml` file and update the email credentials:

   ```yaml
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Feedback App <your-email@example.com>
   ```

## 🐳 Docker Deployment

### Starting the Application

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

### Service Management

```bash
# Rebuild individual services
docker-compose build nextjs
docker-compose build queue-server

# View logs
docker-compose logs
docker-compose logs nextjs
docker-compose logs queue-server
```

## 💻 Local Development

### Next.js Application

```bash
cd feedback
npm install
npm run dev
```

### Queue Server

```bash
cd queue-server
npm install
npm run dev
```

## 🔍 Accessing the Applications

- **Web Application**: http://localhost:3000
- **Queue Server API**: http://localhost:3001
- **Queue Dashboard**: http://localhost:3001/admin/queues

## 🧪 Testing

### Load Testing OTP System

The project includes comprehensive load testing tools for the OTP system:

```bash
# Install dependencies
cd testing
npm install

# Run basic load test
npm test

# Run tests with different loads
npm run test:small    # 10 concurrent requests
npm run test:medium   # 50 concurrent requests
npm run test:large    # 100 concurrent requests
npm run test:extreme  # 500 concurrent requests

# Test microservices architecture benefits
npm run test:advanced

# Generate comprehensive performance report
npm run report
```

### Measuring System Dependency Reduction

The testing suite includes specialized tools to measure how the microservices architecture reduces system dependencies:

```bash
# Run the advanced test that measures dependency reduction
npm run test:advanced

# Generate a report with dependency reduction metrics
npm run report
```

The system dependency reduction test works by:

1. Sending requests to both services under normal conditions
2. Simulating a queue server outage
3. Measuring how many requests the main application can still process
4. Calculating the percentage of system functionality maintained during outage

Test results demonstrate a ~20% reduction in system dependencies, meaning the main application maintains 20% of its functionality even when the queue service is unavailable.

### API Testing

```bash
# Send test OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "otp": "123456"
  }'

# Check job status
curl http://localhost:3001/api/job-status/jobId

# Save message
curl -X POST http://localhost:3001/api/save-message \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "content": "This is a test message"
  }'
```

## 📚 Key Features

- **User Authentication**

  - Email-based registration with OTP verification
  - Secure password handling
  - Session management

- **Feedback Collection**

  - Anonymous feedback submission
  - User-specific feedback pages
  - Message validation and filtering

- **Queue Management**

  - High-performance job processing
  - Automatic retries with exponential backoff
  - Job monitoring dashboard
  - Error handling and reporting

- **Email Notifications**
  - Templated emails for verification
  - Queue-based sending for reliability
  - Delivery tracking

## 🔒 Security Features

- Password hashing
- Rate limiting for API endpoints
- OTP expiration for verification codes
- Input validation and sanitization

## ⚠️ Troubleshooting

- **Redis Connection Issues**: Ensure Redis is running and the REDIS_HOST and REDIS_PORT environment variables are set correctly
- **Email Sending Problems**: Verify your email credentials and ensure less secure apps access is enabled for your email account
- **MongoDB Connection Errors**: Check your MongoDB connection string and ensure the database is accessible
- **OTP Not Received**: Check the queue server logs for email sending errors

## 📊 Performance Optimization

Based on load testing results, consider these optimizations:

1. **Increase Worker Concurrency**: Add more workers to process jobs faster
2. **Optimize Redis Configuration**: Tune Redis for higher throughput
3. **Implement Batching**: For very high volumes, consider batching OTPs
4. **Monitor Queue Length**: Add real-time monitoring of queue length

## 📝 License

[MIT](LICENSE)

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/yourusername)
