# Mail Server with BullMQ

This is a dedicated email service using BullMQ and Redis to queue and process email sending tasks, specifically designed to work with the Next.js Feedback application.

## Features

- Queue-based email processing with BullMQ
- Retry mechanism for failed email deliveries
- Dashboard for monitoring queue status
- RESTful API for adding jobs to the queue
- Docker support for easy deployment

## Setup

### Prerequisites

- Node.js 16+
- Redis server
- Gmail account with App Password

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3001

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Your App <your-email@gmail.com>
```

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start with nodemon for development
npm run dev
```

## API Endpoints

### Send OTP Email

```
POST /api/send-otp
```

Request body:

```json
{
  "email": "user@example.com",
  "username": "testuser",
  "otp": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP email has been queued",
  "jobId": "1a2b3c4d5e"
}
```

### Check Job Status

```
GET /api/job-status/:id
```

Response:

```json
{
  "success": true,
  "jobId": "1a2b3c4d5e",
  "state": "completed",
  "progress": 100
}
```

## Dashboard

A queue monitoring dashboard is available at:

```
http://localhost:3001/admin/queues
```

## Docker

Build and run with Docker:

```bash
docker build -t mail-server .
docker run -p 3001:3001 --env-file .env mail-server
```

Or use docker-compose:

```bash
docker-compose up
```
