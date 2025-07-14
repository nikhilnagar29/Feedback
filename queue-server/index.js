require('dotenv').config();
const express = require('express');
const { Queue } = require('bullmq');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

// Import worker setup
require('./mail-worker');
require('./message-worker');

// Import Redis connection configuration
const client = require('./redis-config');

// console.log( "redisOptions", redisOptions);

// Create email queue
const emailQueue = new Queue('email', { 
  connection: client,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Create message queue for database operations
const messageQueue = new Queue('message', {
  connection: client,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});


// Initialize Express app
const app = express();
app.use(express.json());

// Set up Bull Board (queue monitoring UI)
const serverAdapter = new ExpressAdapter();
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(messageQueue)
  ],
  
  serverAdapter: serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// API endpoint to add email to queue
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, username, otp } = req.body;
    
    if (!email || !username || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, username, and OTP are required' 
      });
    }
    
    // Add job to queue
    const job = await emailQueue.add('send-otp-email', {
      email,
      username,
      otp
    });
    
    res.json({ 
      success: true, 
      message: 'OTP email has been queued',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error adding job to queue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding job to queue' 
    });
  }
});

app.get('/api/check', async (req, res) => {
  res.json({
    success: true,
    message: 'Queue server is running',
  });
});

// API endpoint to save message to database via queue
app.post('/api/save-message', async (req, res) => {
  try {
    const { username, content } = req.body;
    
    if (!username || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and content are required' 
      });
    }
    
    // Add job to message queue
    const job = await messageQueue.add('save-message', {
      username,
      content,
      
    });
    
    res.json({ 
      success: true, 
      message: 'Message has been queued for saving',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error adding message to queue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding message to queue' 
    });
  }
});

// API endpoint to check job status
app.get('/api/job-status/:id', async (req, res) => {
  try {
    // Try to find job in email queue
    let job = await emailQueue.getJob(req.params.id);
    let queueName = 'email';
    
    // If not found in email queue, try message queue
    if (!job) {
      job = await messageQueue.getJob(req.params.id);
      queueName = 'message';
    }
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    const state = await job.getState();
    const progress = job.progress;
    
    res.json({
      success: true,
      jobId: job.id,
      queueName,
      state,
      progress
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching job status' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mail server running on port ${PORT}`);
  console.log(`Queue dashboard available at http://localhost:${PORT}/admin/queues`);
}); 