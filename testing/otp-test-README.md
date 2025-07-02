# OTP Load Testing Tools

This package contains tools for load testing the OTP sending capabilities of your application and measuring the benefits of microservices architecture.

## Prerequisites

- Node.js 14+ installed
- Your application and queue server running (either locally or in Docker)

## Installation

```bash
npm install
```

## Basic Usage

Run a basic load test with default settings (100 concurrent requests):

```bash
npm test
```

Or run directly:

```bash
node otp-load-test.js
```

## Test Variations

We've included several predefined test configurations:

```bash
# Small test (10 concurrent requests)
npm run test:small

# Medium test (50 concurrent requests)
npm run test:medium

# Large test (100 concurrent requests)
npm run test:large

# Extreme test (500 concurrent requests)
npm run test:extreme

# Advanced test with system monitoring and microservices comparison
npm run test:advanced
```

## Advanced Configuration

You can customize the test parameters using command-line arguments:

```bash
node otp-load-test.js --concurrentRequests=200 --batchSize=20 --batchDelay=1000
```

Available options:

| Option                 | Alias | Default               | Description                                |
| ---------------------- | ----- | --------------------- | ------------------------------------------ |
| `--concurrentRequests` | `-c`  | 100                   | Number of concurrent requests to send      |
| `--batchSize`          | `-b`  | 10                    | How many requests to send in each batch    |
| `--batchDelay`         | `-d`  | 500                   | Delay between batches in milliseconds      |
| `--baseUrl`            | `-u`  | http://localhost:3000 | Base URL of the application                |
| `--checkJobStatus`     | `-j`  | true                  | Whether to verify job status after sending |

## Advanced Testing & Microservices Benefits

The advanced test script provides more detailed metrics, system monitoring, and measures the benefits of microservices architecture:

```bash
node otp-advanced-test.js
```

This script will:

1. Send OTP requests in batches
2. Monitor system resources during processing
3. Track queue processing metrics
4. Simulate queue server downtime to measure resilience
5. Calculate system dependency reduction
6. Save detailed results to a JSON file

### Measuring System Dependency Reduction

The advanced test measures system dependency reduction by:

1. Sending requests to both services under normal conditions
2. Simulating queue server downtime (10 seconds)
3. Continuing to send requests during the outage
4. Measuring how many requests the main application can still process
5. Calculating the percentage of system functionality maintained during outage

The test demonstrates that even when the queue server is down, the main application can still:

- Accept and validate user requests
- Queue OTP sending jobs locally
- Provide appropriate feedback to users
- Resume normal processing once the queue server is back online

## Generating Comprehensive Reports

Generate a detailed performance report that includes microservices benefits:

```bash
npm run report
```

This will:

1. Run all test variations (small, medium, large)
2. Run the advanced microservices test
3. Generate a comprehensive Markdown report

The report includes:

- Response time metrics for different load levels
- Success rates and throughput statistics
- System dependency reduction percentage
- Resilience during service outages
- Recommendations for optimization

## Interpreting Results

The test results include:

- **Request Metrics**: Success rate, response times, requests per second
- **Queue Metrics**: Job status distribution, processing times
- **Error Distribution**: Types of errors encountered
- **Microservices Benefits**: System dependency reduction, resilience during outages

## Performance Optimization Tips

Based on test results, consider these optimization strategies:

1. **Increase Worker Concurrency**: If jobs are queuing up but not being processed quickly
2. **Optimize Email Sending**: If email sending is the bottleneck
3. **Redis Configuration**: Tune Redis for higher throughput
4. **Batch Processing**: Consider implementing batch processing for OTPs
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Resilience Patterns**: Add circuit breakers and fallback mechanisms for improved reliability

## Troubleshooting

- **Connection Refused**: Ensure your application and queue server are running
- **High Failure Rate**: Check for rate limiting or email service restrictions
- **Slow Response Times**: Look for bottlenecks in your API or database
- **Metrics API Errors**: Ensure both services have the metrics endpoint available
