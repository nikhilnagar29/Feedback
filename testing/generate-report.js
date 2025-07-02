const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Test configurations
const testConfigurations = [
  { name: 'small', concurrentRequests: 10, batchSize: 5, batchDelay: 500 },
  { name: 'medium', concurrentRequests: 50, batchSize: 10, batchDelay: 500 },
  { name: 'large', concurrentRequests: 100, batchSize: 10, batchDelay: 500 },
  // Uncomment for extreme test
  // { name: 'extreme', concurrentRequests: 500, batchSize: 20, batchDelay: 1000 },
];

// Function to run a test with given configuration
async function runTest(config) {
  return new Promise((resolve, reject) => {
    console.log(`\n========== Running ${config.name} test ==========`);
    console.log(`Parameters: ${config.concurrentRequests} requests, ${config.batchSize} batch size, ${config.batchDelay}ms delay`);
    
    const outputFile = `results-${config.name}-${Date.now()}.json`;
    
    const args = [
      'otp-load-test.js',
      `--concurrentRequests=${config.concurrentRequests}`,
      `--batchSize=${config.batchSize}`,
      `--batchDelay=${config.batchDelay}`
    ];
    
    const testProcess = spawn('node', args);
    
    let stdout = '';
    let stderr = '';
    
    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    testProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Test exited with code ${code}`);
        reject(new Error(`Test failed with code ${code}: ${stderr}`));
        return;
      }
      
      // Extract metrics from stdout
      const metrics = extractMetrics(stdout);
      
      // Save results
      const result = {
        config,
        timestamp: new Date().toISOString(),
        metrics,
        rawOutput: stdout
      };
      
      fs.writeFile(outputFile, JSON.stringify(result, null, 2))
        .then(() => {
          console.log(`Results saved to ${outputFile}`);
          resolve(result);
        })
        .catch(reject);
    });
  });
}

// Function to run advanced test to measure microservices benefits
async function runAdvancedTest() {
  return new Promise((resolve, reject) => {
    console.log(`\n========== Running advanced microservices test ==========`);
    
    const outputFile = `results-microservices-${Date.now()}.json`;
    
    const testProcess = spawn('node', ['otp-advanced-test.js']);
    
    let stdout = '';
    let stderr = '';
    
    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    testProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Advanced test exited with code ${code}`);
        reject(new Error(`Advanced test failed with code ${code}: ${stderr}`));
        return;
      }
      
      // Extract metrics from stdout
      const metrics = extractAdvancedMetrics(stdout);
      
      // Save results
      const result = {
        timestamp: new Date().toISOString(),
        metrics,
        rawOutput: stdout
      };
      
      fs.writeFile(outputFile, JSON.stringify(result, null, 2))
        .then(() => {
          console.log(`Advanced test results saved to ${outputFile}`);
          resolve(result);
        })
        .catch(reject);
    });
  });
}

// Function to extract metrics from test output
function extractMetrics(output) {
  const metrics = {};
  
  // Extract success rate
  const successRateMatch = output.match(/Success Rate: ([\d.]+)%/);
  if (successRateMatch) {
    metrics.successRate = parseFloat(successRateMatch[1]);
  }
  
  // Extract response times
  const minResponseMatch = output.match(/Min Response Time: ([\d.]+)ms/);
  if (minResponseMatch) {
    metrics.minResponseTime = parseFloat(minResponseMatch[1]);
  }
  
  const maxResponseMatch = output.match(/Max Response Time: ([\d.]+)ms/);
  if (maxResponseMatch) {
    metrics.maxResponseTime = parseFloat(maxResponseMatch[1]);
  }
  
  const avgResponseMatch = output.match(/Avg Response Time: ([\d.]+)ms/);
  if (avgResponseMatch) {
    metrics.avgResponseTime = parseFloat(avgResponseMatch[1]);
  }
  
  // Extract requests per second
  const rpsMatch = output.match(/Requests per Second: ([\d.]+)/);
  if (rpsMatch) {
    metrics.requestsPerSecond = parseFloat(rpsMatch[1]);
  }
  
  return metrics;
}

// Function to extract advanced metrics from microservices test
function extractAdvancedMetrics(output) {
  const metrics = extractMetrics(output);
  
  // Extract microservices specific metrics
  const dependencyReductionMatch = output.match(/System Dependency Reduction: ([\d.]+)%/);
  if (dependencyReductionMatch) {
    metrics.systemDependencyReduction = parseFloat(dependencyReductionMatch[1]);
  }
  
  const downtimeMatch = output.match(/Queue Server Simulated Downtime: ([\d.]+) seconds/);
  if (downtimeMatch) {
    metrics.queueServerDowntime = parseFloat(downtimeMatch[1]);
  }
  
  const recoveredRequestsMatch = output.match(/Requests Processed During Downtime: ([\d.]+)/);
  if (recoveredRequestsMatch) {
    metrics.recoveredRequests = parseFloat(recoveredRequestsMatch[1]);
  }
  
  return metrics;
}

// Function to generate a comprehensive report
async function generateReport(results, advancedResults) {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportFile = `otp-performance-report-${reportDate}.md`;
  
  let report = `# OTP Performance Test Report\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `| Test | Requests | Success Rate | Avg Response Time | Requests/sec |\n`;
  report += `|------|----------|-------------|-------------------|-------------|\n`;
  
  for (const result of results) {
    report += `| ${result.config.name} | ${result.config.concurrentRequests} | ${result.metrics.successRate}% | ${result.metrics.avgResponseTime}ms | ${result.metrics.requestsPerSecond} |\n`;
  }
  
  report += `\n## Detailed Results\n\n`;
  
  for (const result of results) {
    report += `### ${result.config.name.toUpperCase()} Test (${result.config.concurrentRequests} requests)\n\n`;
    report += `- **Batch Size:** ${result.config.batchSize}\n`;
    report += `- **Batch Delay:** ${result.config.batchDelay}ms\n`;
    report += `- **Success Rate:** ${result.metrics.successRate}%\n`;
    report += `- **Min Response Time:** ${result.metrics.minResponseTime}ms\n`;
    report += `- **Max Response Time:** ${result.metrics.maxResponseTime}ms\n`;
    report += `- **Avg Response Time:** ${result.metrics.avgResponseTime}ms\n`;
    report += `- **Requests per Second:** ${result.metrics.requestsPerSecond}\n\n`;
  }
  
  // Add microservices architecture benefits section if available
  if (advancedResults && advancedResults.metrics.systemDependencyReduction) {
    report += `## Microservices Architecture Benefits\n\n`;
    report += `### System Dependency Reduction\n\n`;
    report += `- **Dependency Reduction:** ${advancedResults.metrics.systemDependencyReduction}%\n`;
    report += `- **Queue Server Downtime:** ${advancedResults.metrics.queueServerDowntime} seconds\n`;
    report += `- **Requests Processed During Downtime:** ${advancedResults.metrics.recoveredRequests}\n\n`;
    
    report += `### Key Benefits\n\n`;
    report += `1. **Reduced System Dependencies:** The microservices architecture reduces system dependencies by approximately ${advancedResults.metrics.systemDependencyReduction}%, allowing the main application to continue functioning even when the queue service is down.\n\n`;
    report += `2. **Improved Fault Isolation:** When the queue server experiences downtime, the main application can still accept and queue requests locally, preventing user-facing errors.\n\n`;
    report += `3. **Independent Scaling:** Each service can be scaled independently based on its specific resource requirements, optimizing resource utilization.\n\n`;
    report += `4. **Enhanced Maintenance:** Services can be updated independently, reducing the need for system-wide downtime during deployments.\n\n`;
  }
  
  report += `## Conclusions\n\n`;
  
  // Add some analysis based on the results
  const maxRps = Math.max(...results.map(r => r.metrics.requestsPerSecond));
  const bestTest = results.find(r => r.metrics.requestsPerSecond === maxRps);
  
  report += `- The system achieved a maximum throughput of **${maxRps}** requests per second during the **${bestTest.config.name}** test.\n`;
  
  // Compare response times across tests
  if (results.length > 1) {
    const smallTest = results.find(r => r.config.name === 'small');
    const largeTest = results.find(r => r.config.name === 'large');
    
    if (smallTest && largeTest) {
      const responseTimeDiff = ((largeTest.metrics.avgResponseTime - smallTest.metrics.avgResponseTime) / smallTest.metrics.avgResponseTime * 100).toFixed(2);
      
      if (responseTimeDiff > 0) {
        report += `- Response times increased by **${responseTimeDiff}%** when scaling from ${smallTest.config.concurrentRequests} to ${largeTest.config.concurrentRequests} concurrent requests.\n`;
      } else {
        report += `- Response times remained stable or improved when scaling from ${smallTest.config.concurrentRequests} to ${largeTest.config.concurrentRequests} concurrent requests.\n`;
      }
    }
  }
  
  // Add microservices conclusion if available
  if (advancedResults && advancedResults.metrics.systemDependencyReduction) {
    report += `- The microservices architecture demonstrated a **${advancedResults.metrics.systemDependencyReduction}%** reduction in system dependencies, allowing the application to continue functioning during queue service outages.\n`;
  }
  
  report += `\n## Recommendations\n\n`;
  
  // Add recommendations based on the results
  const avgSuccessRate = results.reduce((sum, r) => sum + r.metrics.successRate, 0) / results.length;
  
  if (avgSuccessRate < 95) {
    report += `- **Improve Reliability:** The average success rate of ${avgSuccessRate.toFixed(2)}% indicates potential reliability issues. Consider implementing retry mechanisms or improving error handling.\n`;
  }
  
  const highestAvgResponseTime = Math.max(...results.map(r => r.metrics.avgResponseTime));
  
  if (highestAvgResponseTime > 1000) {
    report += `- **Optimize Response Time:** The highest average response time was ${highestAvgResponseTime}ms, which exceeds 1 second. Consider optimizing the OTP generation and queue processing.\n`;
  }
  
  report += `- **Queue Worker Scaling:** Based on the throughput metrics, consider adjusting the number of queue workers to match your expected load.\n`;
  
  // Add microservices recommendations if available
  if (advancedResults && advancedResults.metrics.systemDependencyReduction) {
    report += `- **Enhance Resilience:** Continue developing the microservices architecture to further reduce system dependencies. Consider implementing local fallback mechanisms for critical services.\n`;
    report += `- **Monitoring:** Implement comprehensive monitoring for each microservice to quickly identify and address issues.\n`;
    report += `- **Circuit Breakers:** Add circuit breakers between services to gracefully handle service outages and prevent cascading failures.\n`;
  }
  
  await fs.writeFile(reportFile, report);
  console.log(`\nComprehensive report generated: ${reportFile}`);
  
  return reportFile;
}

// Main function to run all tests and generate report
async function runAllTests() {
  console.log('Starting OTP performance testing suite...');
  
  const results = [];
  let advancedResults = null;
  
  for (const config of testConfigurations) {
    try {
      const result = await runTest(config);
      results.push(result);
    } catch (error) {
      console.error(`Error running ${config.name} test:`, error.message);
    }
  }
  
  // Run advanced test for microservices benefits
  try {
    advancedResults = await runAdvancedTest();
  } catch (error) {
    console.error('Error running advanced microservices test:', error.message);
  }
  
  if (results.length > 0) {
    await generateReport(results, advancedResults);
  } else {
    console.error('No test results available to generate report.');
  }
}

// Run all tests
runAllTests().catch(console.error); 