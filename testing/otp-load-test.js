const axios = require('axios');
const { performance } = require('perf_hooks');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('concurrentRequests', {
    alias: 'c',
    type: 'number',
    default: 100,
    description: 'Number of concurrent requests to send'
  })
  .option('batchSize', {
    alias: 'b',
    type: 'number',
    default: 10,
    description: 'How many requests to send in each batch'
  })
  .option('batchDelay', {
    alias: 'd',
    type: 'number',
    default: 500,
    description: 'Delay between batches in milliseconds'
  })
  .option('baseUrl', {
    alias: 'u',
    type: 'string',
    default: 'https://feedback-two-xi.vercel.app',
    description: 'Base URL of the application'
  })
  .option('checkJobStatus', {
    alias: 'j',
    type: 'boolean',
    default: true,
    description: 'Whether to verify job status after sending'
  })
  .help()
  .argv;

// Configuration
const config = {
  // Base URL of your application
  baseUrl: argv.baseUrl,
  // Number of concurrent requests to send
  concurrentRequests: argv.concurrentRequests,
  // Delay between batches of requests (in ms)
  batchDelay: argv.batchDelay,
  // Batch size (how many requests to send in each batch)
  batchSize: argv.batchSize,
  // Whether to verify job status after sending
  checkJobStatus: argv.checkJobStatus
};

// Results storage
const results = {
  totalRequests: config.concurrentRequests,
  successfulRequests: 0,
  failedRequests: 0,
  totalTime: 0,
  minResponseTime: Number.MAX_VALUE,
  maxResponseTime: 0,
  avgResponseTime: 0,
  responseTimes: [],
  errors: [],
  jobStatuses: {}
};

// Test data generator
const generateTestData = (index) => {
  return {
    email: `test${index}@example.com`,
    username: `testuser${index}`,
    otp: Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
  };
};

// Function to send a single OTP request
async function sendOtpRequest(index) {
  const data = generateTestData(index);
  const startTime = performance.now();
  
  try {
    const response = await axios.post(`${config.baseUrl}/api/send-otp`, data);
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.successfulRequests++;
    results.responseTimes.push(responseTime);
    results.minResponseTime = Math.min(results.minResponseTime, responseTime);
    results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
    
    if (config.checkJobStatus && response.data.jobId) {
      results.jobStatuses[response.data.jobId] = {
        status: 'queued',
        responseTime
      };
      
      // Return job ID for status checking
      return response.data.jobId;
    }
    
    return null;
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.failedRequests++;
    results.errors.push({
      index,
      message: error.message,
      response: error.response ? error.response.data : null,
      responseTime
    });
    
    return null;
  }
}

// Function to check job status
async function checkJobStatus(jobId) {
  try {
    const response = await axios.get(`${config.baseUrl}/api/job-status/${jobId}`);
    results.jobStatuses[jobId].status = response.data.state;
    return response.data;
  } catch (error) {
    results.jobStatuses[jobId].status = 'error';
    results.jobStatuses[jobId].error = error.message;
    return null;
  }
}

// Function to send requests in batches
async function sendRequestsInBatches() {
  const startTime = performance.now();
  const jobIds = [];
  
  console.log(`Starting OTP load test with ${config.concurrentRequests} requests...`);
  console.log(`Sending in batches of ${config.batchSize} with ${config.batchDelay}ms delay between batches`);
  
  // Send requests in batches
  for (let i = 0; i < config.concurrentRequests; i += config.batchSize) {
    const batchPromises = [];
    const batchSize = Math.min(config.batchSize, config.concurrentRequests - i);
    
    console.log(`Sending batch ${Math.floor(i/config.batchSize) + 1} (${i+1} to ${i+batchSize})`);
    
    // Create batch of promises
    for (let j = 0; j < batchSize; j++) {
      batchPromises.push(sendOtpRequest(i + j));
    }
    
    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);
    jobIds.push(...batchResults.filter(id => id !== null));
    
    // Delay before next batch if not the last batch
    if (i + batchSize < config.concurrentRequests) {
      await new Promise(resolve => setTimeout(resolve, config.batchDelay));
    }
  }
  
  const endTime = performance.now();
  results.totalTime = endTime - startTime;
  
  // Calculate average response time
  if (results.responseTimes.length > 0) {
    results.avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  }
  
  // Check job statuses if enabled
  if (config.checkJobStatus && jobIds.length > 0) {
    console.log(`Checking status for ${jobIds.length} jobs...`);
    
    // Wait a bit to allow jobs to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check all job statuses
    const statusPromises = jobIds.map(jobId => checkJobStatus(jobId));
    await Promise.all(statusPromises);
  }
  
  return results;
}

// Function to print results
function printResults(results) {
  console.log('\n========== OTP LOAD TEST RESULTS ==========');
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Successful Requests: ${results.successfulRequests}`);
  console.log(`Failed Requests: ${results.failedRequests}`);
  console.log(`Success Rate: ${((results.successfulRequests / results.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Total Time: ${results.totalTime.toFixed(2)}ms`);
  
  if (results.responseTimes.length > 0) {
    console.log(`Min Response Time: ${results.minResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${results.maxResponseTime.toFixed(2)}ms`);
    console.log(`Avg Response Time: ${results.avgResponseTime.toFixed(2)}ms`);
    console.log(`Requests per Second: ${(results.successfulRequests / (results.totalTime / 1000)).toFixed(2)}`);
  }
  
  if (config.checkJobStatus) {
    const jobStatuses = Object.values(results.jobStatuses);
    const statusCounts = jobStatuses.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nJob Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} (${((count / jobStatuses.length) * 100).toFixed(2)}%)`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\nError Distribution:');
    const errorGroups = results.errors.reduce((acc, error) => {
      const key = error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(errorGroups).forEach(([message, count]) => {
      console.log(`  "${message}": ${count} occurrences`);
    });
  }
  
  console.log('===========================================');
}

// Run the test
async function runTest() {
  try {
    const results = await sendRequestsInBatches();
    printResults(results);
    
    // Return results for potential further processing
    return results;
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute the test
runTest(); 