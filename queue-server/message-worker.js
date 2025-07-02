const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const client = require('./redis-config');
const { UserModel, MessageSchema } = require('./model/user');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback';

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Connect to MongoDB when starting up
connectToMongoDB();

// Create a worker to process message jobs
const messageWorker = new Worker('message', async (job) => {
    console.log(`Processing message job ${job.id} of type ${job.name}`);
    
    // Update progress
    await job.updateProgress(10);
    
    try {
      if (job.name === 'save-message') {
        const { username, content } = job.data;
        
        console.log(`Saving message for user ${username}`);
        
        // Update progress
        await job.updateProgress(30);
        
        // Find the user by username
        const user = await UserModel.findOne({ username });
        
        if (!user) {
          throw new Error(`User ${username} not found`);
        }
        
        // Check if user is accepting messages
        if (!user.isAcceptingMessages) {
          throw new Error(`User ${username} is not accepting messages`);
        }
        
        // Add message to user's messages array
        user.messages.push({
          content,
          createdAt: new Date()
        });
        
        // Save the user
        await user.save();
        
        // Update progress
        await job.updateProgress(100);
        
        console.log(`Message saved successfully for user ${username}`);
        
        return {
          success: true,
          username,
          type: 'user_message'
        };
      }
    } catch (error) {
      console.error('Error processing message job:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }, { connection: client });
  
  // Event handlers for the message worker
  messageWorker.on('completed', (job) => {
    console.log(`Message job ${job.id} has completed successfully`);
  });
  
  messageWorker.on('failed', (job, err) => {
    console.error(`Message job ${job.id} has failed with error ${err.message}`);
  });
  
  console.log('Message worker is running and waiting for jobs...');

  module.exports = messageWorker;