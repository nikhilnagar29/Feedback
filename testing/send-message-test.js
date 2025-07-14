const API_URL = 'https://feedback-two-xi.vercel.app/api/send-message'; // Replace with your API endpoint
const NUM_CALLS = 500;
const CONCURRENCY_LIMIT = 100; // Number of requests to run concurrently

async function callApiAndMeasureTime(url) {
    const startTime = performance.now();
    try {
        // You might need to adjust fetch options (method, headers, body)
        // based on your API. For a simple GET:
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "username":"nine-ji" ,
                "content":"this message goes in queue" 
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // You can choose to parse the response body or not, depending on your needs
        // const data = await response.json(); 
    } catch (error) {
        console.error(`Error calling API: ${error.message}`);
        return null; // Return null for failed requests
    } finally {
        const endTime = performance.now();
        return endTime - startTime;
    }
}


async function runLoadTest() {
    const responseTimes = [];
    const promises = [];
    let successfulCalls = 0;

    console.log(`Starting load test for ${NUM_CALLS} API calls...`);

    for (let i = 0; i < NUM_CALLS; i++) {
        // Add a small delay between batches to avoid overwhelming the server
        // This makes the concurrency more controlled
        if (promises.length >= CONCURRENCY_LIMIT) {
            await Promise.all(promises);
            promises.length = 0; // Clear the array for the next batch
        }

        promises.push(callApiAndMeasureTime(API_URL).then(time => {
            if (time !== null) {
                responseTimes.push(time);
                successfulCalls++;
            }
        }));
    }

    // Wait for any remaining promises to resolve
    await Promise.all(promises);

    const totalResponseTime = responseTimes.reduce((sum, time) => sum + time, 0);
    const averageResponseTime = successfulCalls > 0 ? totalResponseTime / successfulCalls : 0;
    const errorRate = ((NUM_CALLS - successfulCalls) / NUM_CALLS) * 100;

    console.log(`\n--- Load Test Results ---`);
    console.log(`Total calls attempted: ${NUM_CALLS}`);
    console.log(`Successful calls: ${successfulCalls}`);
    console.log(`Failed calls: ${NUM_CALLS - successfulCalls}`);
    console.log(`Error Rate: ${errorRate.toFixed(2)}%`);

    if (successfulCalls > 0) {
        console.log(`Average Response Time: ${averageResponseTime.toFixed(2)} ms`);
        // Optional: Calculate and log min/max/percentiles if needed
        responseTimes.sort((a, b) => a - b);
        console.log(`Min Response Time: ${responseTimes[0].toFixed(2)} ms`);
        console.log(`Max Response Time: ${responseTimes[responseTimes.length - 1].toFixed(2)} ms`);
        console.log(`P90 Response Time: ${responseTimes[Math.floor(successfulCalls * 0.90) - 1]?.toFixed(2) || 'N/A'} ms`);
        console.log(`P95 Response Time: ${responseTimes[Math.floor(successfulCalls * 0.95) - 1]?.toFixed(2) || 'N/A'} ms`);

    } else {
        console.log("No successful calls to calculate average response time.");
    }
}

// Ensure performance.now() is available in Node.js
// For browser environments, performance.now() is globally available.
// For Node.js, you might need to require it or use process.hrtime().
// Node.js v16+ has performance.now() globally.
// If running older Node.js, replace performance.now() with:
// const { performance } = require('perf_hooks');

runLoadTest();