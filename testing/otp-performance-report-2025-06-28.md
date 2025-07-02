# OTP Performance Test Report

**Date:** 2025-06-28T08:31:38.992Z

## Summary

| Test | Requests | Success Rate | Avg Response Time | Requests/sec |
|------|----------|-------------|-------------------|-------------|
| small | 10 | 100% | 91.23ms | 14.2 |
| medium | 50 | 100% | 174.88ms | 16.75 |
| large | 100 | 100% | 144.27ms | 16.3 |

## Detailed Results

### SMALL Test (10 requests)

- **Batch Size:** 5
- **Batch Delay:** 500ms
- **Success Rate:** 100%
- **Min Response Time:** 85.54ms
- **Max Response Time:** 104.45ms
- **Avg Response Time:** 91.23ms
- **Requests per Second:** 14.2

### MEDIUM Test (50 requests)

- **Batch Size:** 10
- **Batch Delay:** 500ms
- **Success Rate:** 100%
- **Min Response Time:** 117.11ms
- **Max Response Time:** 345.07ms
- **Avg Response Time:** 174.88ms
- **Requests per Second:** 16.75

### LARGE Test (100 requests)

- **Batch Size:** 10
- **Batch Delay:** 500ms
- **Success Rate:** 100%
- **Min Response Time:** 100.72ms
- **Max Response Time:** 236.85ms
- **Avg Response Time:** 144.27ms
- **Requests per Second:** 16.3

## Conclusions

- The system achieved a maximum throughput of **16.75** requests per second during the **medium** test.
- Response times increased by **58.14%** when scaling from 10 to 100 concurrent requests.

## Recommendations

- **Queue Worker Scaling:** Based on the throughput metrics, consider adjusting the number of queue workers to match your expected load.
