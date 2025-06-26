# Feedback Application

A complete feedback system with a Next.js frontend and a queue processing server.

## Project Structure

- `feedback/` - Next.js web application
- `queue-server/` - Queue processing server for handling emails and other background tasks
- `docker-compose.yml` - Docker configuration for all services

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### Environment Setup

1. **Feedback App Setup**

   ```bash
   cp feedback/env.example feedback/.env.local
   ```

2. **Queue Server Setup**

   ```bash
   cp queue-server/env.example queue-server/.env
   ```

3. **Update Email Settings**
   Edit the `docker-compose.yml` file and update the email credentials:
   ```yaml
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Feedback App <your-email@example.com>
   ```

### Running with Docker

1. **Start all services**

   ```bash
   docker-compose up
   ```

2. **Start in detached mode**

   ```bash
   docker-compose up -d
   ```

3. **Build and start**

   ```bash
   docker-compose up --build
   ```

4. **Stop all services**
   ```bash
   docker-compose down
   ```

## Accessing the Applications

- **Web Application**: http://localhost:3000
- **Queue Server API**: http://localhost:3001

## Testing the Queue Server API

### Send Test Email

```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This is a test email from the queue server"
  }'
```

### Check Queue Status

```bash
curl http://localhost:3001/api/queue-status
```

### Add Job to Queue

```bash
curl -X POST http://localhost:3001/api/add-job \
  -H "Content-Type: application/json" \
  -d '{
    "type": "notification",
    "data": {
      "userId": "123",
      "message": "Your feedback has been received"
    }
  }'
```

## Development

### Rebuilding Individual Services

```bash
docker-compose build nextjs
docker-compose build queue-server
```

### Viewing Logs

```bash
docker-compose logs
docker-compose logs nextjs
docker-compose logs queue-server
```

## Troubleshooting

- **Redis Connection Issues**: Ensure Redis is running and the REDIS_HOST and REDIS_PORT environment variables are set correctly
- **Email Sending Problems**: Verify your email credentials and ensure less secure apps access is enabled for your email account

## License

[MIT](LICENSE)
