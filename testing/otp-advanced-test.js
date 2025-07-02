const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const os = require('os');

// Configuration
const config = {
  // Base URL of your application
  baseUrl: 'http://localhost:3000',
  // Mail server URL for monitoring
  mailServerUrl: 'http://localhost:3001',
  // Number of concurrent requests to send
  concurrentRequests: 100,
  // Delay between batches of requests (in ms)
  batchDelay: 500,
  // Batch size (how many requests to send in each batch)
  batchSize: 10,
  // Whether to verify job status after sending
  checkJobStatus: true,
  // How long to monitor queue processing (ms)
  monitorDuration: 30000,
  // How often to check queue stats (ms)
  monitorInterval: 1000,
  // Output file for results
  outputFile: 'otp-test-results.json',
  // Whether to monitor system metrics
  monitorSystem: true,
  // Whether to compare with monolithic approach
  compareMicroservices: true,
  // How many tests to run for comparison
  comparisonTests: 3
};

// Results storage
const results = {
  testConfig: { ...config },
  system: {
    platform: os.platform(),
    cpuCores: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem()
  },
  requests: {
    totalRequests: config.concurrentRequests,
    successfulRequests: 0,
    failedRequests: 0,
    totalTime: 0,
    minResponseTime: Number.MAX_VALUE,
    maxResponseTime: 0,
    avgResponseTime: 0,
    responseTimes: [],
    errors: [],
    requestsPerSecond: 0
  },
  queue: {
    snapshots: [],
    processingTime: {
      min: Number.MAX_VALUE,
      max: 0,
      avg: 0,
      total: 0
    }
  },
  jobStatuses: {},
  microservicesComparison: {
    nextAppCpuUsage: [],
    queueServerCpuUsage: [],
    nextAppMemoryUsage: [],
    queueServerMemoryUsage: [],
    systemDependencyReduction: 0,
    resilience: {
      queueServerDowntime: 0,
      recoveredRequests: 0
    }
  }
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
    
    results.requests.successfulRequests++;
    results.requests.responseTimes.push(responseTime);
    results.requests.minResponseTime = Math.min(results.requests.minResponseTime, responseTime);
    results.requests.maxResponseTime = Math.max(results.requests.maxResponseTime, responseTime);
    
    if (config.checkJobStatus && response.data.jobId) {
      results.jobStatuses[response.data.jobId] = {
        status: 'queued',
        queuedAt: new Date().toISOString(),
        responseTime,
        data: { ...data }
      };
      
      // Return job ID for status checking
      return response.data.jobId;
    }
    
    return null;
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.requests.failedRequests++;
    results.requests.errors.push({
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
    const response = await axios.get(`${config.mailServerUrl}/api/job-status/${jobId}`);
    const job = results.jobStatuses[jobId];
    
    if (job) {
      job.status = response.data.state;
      job.checkedAt = new Date().toISOString();
      
      // Calculate processing time if job is completed
      if (response.data.state === 'completed') {
        job.completedAt = new Date().toISOString();
        const queuedAt = new Date(job.queuedAt).getTime();
        const completedAt = new Date(job.completedAt).getTime();
        const processingTime = completedAt - queuedAt;
        
        job.processingTime = processingTime;
        
        // Update processing time stats
        results.queue.processingTime.min = Math.min(results.queue.processingTime.min, processingTime);
        results.queue.processingTime.max = Math.max(results.queue.processingTime.max, processingTime);
        results.queue.processingTime.total += processingTime;
      }
    }
    
    return response.data;
  } catch (error) {
    if (results.jobStatuses[jobId]) {
      results.jobStatuses[jobId].status = 'error';
      results.jobStatuses[jobId].error = error.message;
    }
    return null;
  }
}

// Function to get queue metrics
async function getQueueMetrics() {
  try {
    // This would ideally connect to Bull dashboard API or Redis directly
    // For now, we'll use the job status endpoint as a proxy
    const systemInfo = {
      timestamp: new Date().toISOString(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      systemMemory: {
        total: os.totalmem(),
        free: os.freemem(),
        usedPercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      loadAverage: os.loadavg()
    };
    
    results.queue.snapshots.push(systemInfo);
    return systemInfo;
  } catch (error) {
    console.error('Error getting queue metrics:', error.message);
    return null;
  }
}

// Function to monitor queue processing
async function monitorQueueProcessing(duration, interval) {
  console.log(`\nMonitoring queue processing for ${duration/1000} seconds...`);
  
  const startTime = Date.now();
  const endTime = startTime + duration;
  
  while (Date.now() < endTime) {
    await getQueueMetrics();
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  // Calculate average processing time
  const completedJobs = Object.values(results.jobStatuses).filter(job => job.processingTime);
  if (completedJobs.length > 0) {
    results.queue.processingTime.avg = results.queue.processingTime.total / completedJobs.length;
  }
  
  console.log('Queue monitoring completed.');
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
  results.requests.totalTime = endTime - startTime;
  
  // Calculate average response time and requests per second
  if (results.requests.responseTimes.length > 0) {
    results.requests.avgResponseTime = results.requests.responseTimes.reduce((a, b) => a + b, 0) / results.requests.responseTimes.length;
    results.requests.requestsPerSecond = (results.requests.successfulRequests / (results.requests.totalTime / 1000)).toFixed(2);
  }
  
  console.log(`\nAll requests sent. ${jobIds.length} jobs queued successfully.`);
  
  // Check job statuses if enabled
  if (config.checkJobStatus && jobIds.length > 0) {
    console.log(`\nChecking initial status for ${jobIds.length} jobs...`);
    
    // Check all job statuses
    const statusPromises = jobIds.map(jobId => checkJobStatus(jobId));
    await Promise.all(statusPromises);
    
    // Monitor queue processing
    await monitorQueueProcessing(config.monitorDuration, config.monitorInterval);
    
    // Final status check
    console.log('\nPerforming final status check...');
    const finalStatusPromises = jobIds.map(jobId => checkJobStatus(jobId));
    await Promise.all(finalStatusPromises);
  }
  
  return results;
}

// Function to measure system dependency reduction
async function measureSystemDependency() {
  console.log('\nMeasuring system dependency reduction with microservices architecture...');
  
  // Get metrics from both services
  try {
    // Collect Next.js app metrics
    const nextAppMetrics = await axios.get(`${config.baseUrl}/api/metrics`);
    results.microservicesComparison.nextAppCpuUsage.push(nextAppMetrics.data.cpu);
    results.microservicesComparison.nextAppMemoryUsage.push(nextAppMetrics.data.memory);
    
    // Collect queue server metrics
    const queueServerMetrics = await axios.get(`${config.mailServerUrl}/api/metrics`);
    results.microservicesComparison.queueServerCpuUsage.push(queueServerMetrics.data.cpu);
    results.microservicesComparison.queueServerMemoryUsage.push(queueServerMetrics.data.memory);
    
    console.log('Successfully collected metrics from both services');
  } catch (error) {
    console.error('Error measuring system dependency:', error.message);
  }
}

// Function to simulate queue server downtime and measure resilience
async function testSystemResilience() {
  console.log('\nTesting system resilience with simulated queue server downtime...');
  
  try {
    // Send requests before simulating downtime
    const normalRequests = 20;
    let successfulBefore = 0;
    
    for (let i = 0; i < normalRequests; i++) {
      const response = await axios.post(`${config.baseUrl}/api/send-otp`, generateTestData(i));
      if (response.status === 200) {
        successfulBefore++;
      }
    }
    
    // Simulate queue server downtime by calling the test endpoint
    await axios.post(`${config.mailServerUrl}/api/test/simulate-downtime`, { durationSeconds: 10 });
    
    console.log('Queue server downtime simulated. Sending requests during downtime...');
    
    // Send requests during simulated downtime
    const downtimeRequests = 20;
    let successfulDuring = 0;
    
    for (let i = 0; i < downtimeRequests; i++) {
      try {
        const response = await axios.post(`${config.baseUrl}/api/send-otp`, generateTestData(i + normalRequests));
        if (response.status === 200) {
          successfulDuring++;
        }
      } catch (error) {
        // Expected some errors during downtime
      }
    }
    
    // Wait for recovery
    await new Promise(resolve => setTimeout(resolve, 12000));
    
    // Calculate resilience metrics
    results.microservicesComparison.resilience.queueServerDowntime = 10; // seconds
    results.microservicesComparison.resilience.recoveredRequests = successfulDuring;
    
    // Calculate dependency reduction based on continued operation during downtime
    const dependencyReduction = (successfulDuring / downtimeRequests) * 100;
    results.microservicesComparison.systemDependencyReduction = Math.round(dependencyReduction);
    
    console.log(`System dependency reduction measured: ${results.microservicesComparison.systemDependencyReduction}%`);
  } catch (error) {
    console.error('Error testing system resilience:', error.message);
  }
}

// Function to print results
function printResults(results) {
  console.log('\n========== OTP LOAD TEST RESULTS ==========');
  console.log(`System: ${results.system.platform}, ${results.system.cpuCores} CPU cores`);
  console.log(`Memory: ${(results.system.totalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB total, ${(results.system.freeMemory / (1024 * 1024 * 1024)).toFixed(2)} GB free`);
  
  console.log('\n--- REQUEST METRICS ---');
  console.log(`Total Requests: ${results.requests.totalRequests}`);
  console.log(`Successful Requests: ${results.requests.successfulRequests}`);
  console.log(`Failed Requests: ${results.requests.failedRequests}`);
  console.log(`Success Rate: ${((results.requests.successfulRequests / results.requests.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Total Time: ${(results.requests.totalTime / 1000).toFixed(2)} seconds`);
  
  if (results.requests.responseTimes.length > 0) {
    console.log(`Min Response Time: ${results.requests.minResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${results.requests.maxResponseTime.toFixed(2)}ms`);
    console.log(`Avg Response Time: ${results.requests.avgResponseTime.toFixed(2)}ms`);
    console.log(`Requests per Second: ${results.requests.requestsPerSecond}`);
  }
  
  // Job status distribution
  const jobStatuses = Object.values(results.jobStatuses);
  const statusCounts = jobStatuses.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n--- QUEUE METRICS ---');
  console.log('Job Status Distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} (${((count / jobStatuses.length) * 100).toFixed(2)}%)`);
  });
  
  // Processing time metrics
  if (results.queue.processingTime.avg > 0) {
    console.log('\nProcessing Time:');
    console.log(`  Min: ${results.queue.processingTime.min}ms`);
    console.log(`  Max: ${results.queue.processingTime.max}ms`);
    console.log(`  Avg: ${results.queue.processingTime.avg.toFixed(2)}ms`);
    console.log(`  Throughput: ${(1000 / results.queue.processingTime.avg).toFixed(2)} jobs/second`);
  }
  
  if (results.requests.errors.length > 0) {
    console.log('\n--- ERROR DISTRIBUTION ---');
    const errorGroups = results.requests.errors.reduce((acc, error) => {
      const key = error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(errorGroups).forEach(([message, count]) => {
      console.log(`  "${message}": ${count} occurrences`);
    });
  }
  
  // Print microservices comparison if available
  if (results.microservicesComparison && results.microservicesComparison.systemDependencyReduction > 0) {
    console.log('\n========== MICROSERVICES ARCHITECTURE BENEFITS ==========');
    console.log(`System Dependency Reduction: ${results.microservicesComparison.systemDependencyReduction}%`);
    console.log(`Queue Server Simulated Downtime: ${results.microservicesComparison.resilience.queueServerDowntime} seconds`);
    console.log(`Requests Processed During Downtime: ${results.microservicesComparison.resilience.recoveredRequests}`);
    console.log('=======================================================');
  }
  
  console.log('\nDetailed results saved to:', config.outputFile);
  console.log('===========================================');
}

// Save results to file
async function saveResults(results) {
  try {
    // Remove large arrays from saved results to keep file size reasonable
    const resultsToSave = { ...results };
    resultsToSave.requests.responseTimes = resultsToSave.requests.responseTimes.length;
    
    await fs.writeFile(config.outputFile, JSON.stringify(resultsToSave, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving results:', error);
    return false;
  }
}

// Run the test
async function runTest() {
  try {
    console.log('Starting OTP load test...');
    const testResults = await sendRequestsInBatches();
    
    // New metrics for microservices architecture
    if (config.compareMicroservices) {
      // Measure system dependency reduction
      await measureSystemDependency();
      
      // Test system resilience
      await testSystemResilience();
    }
    
    // Save results to file
    await saveResults(testResults);
    
    // Print summary
    printResults(testResults);
    
    return testResults;
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute the test
runTest(); 