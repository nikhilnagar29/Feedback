require('dotenv').config();
const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');

// Email credentials
const EMAIL_USER = process.env.EMAIL_USER || 'sociogram.verify.team@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'your-app-password';
const EMAIL_FROM = process.env.EMAIL_FROM || `"Feedback App" <${EMAIL_USER}>`;

// Import Redis connection configuration
const redisOptions = require('./redis-config');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

// Create HTML content for OTP email
const createOtpEmailHtml = (username, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${username},</h2>
      <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
        ${otp}
      </div>
      <p>If you did not request this code, please ignore this email.</p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
};

// Create a worker to process email jobs
const emailWorker = new Worker('email', async (job) => {
  console.log(`Processing email job ${job.id} of type ${job.name}`);
  
  // Update progress
  await job.updateProgress(10);
  
  try {
    // Create a new transporter for each job
    const transporter = createTransporter();
    
    // Update progress
    await job.updateProgress(30);
    
    if (job.name === 'send-otp-email') {
      const { email, username, otp } = job.data;
      
      console.log(`Sending OTP email to ${email}`);
      
      // Create email content
      const htmlContent = createOtpEmailHtml(username, otp);
      
      // Update progress
      await job.updateProgress(60);
      
      // Send email
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: 'Verification Code for Feedback App',
        html: htmlContent,
      });
      
      // Update progress to complete
      await job.updateProgress(100);
      
      console.log(`Email sent successfully: ${info.messageId}`);
      
      // Return result
      return {
        success: true,
        messageId: info.messageId,
      };
    }
  } catch (error) {
    console.error('Error processing email job:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}, { connection: redisOptions });


// Event handlers for the email worker
emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} has completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job.id} has failed with error ${err.message}`);
});



module.exports = { emailWorker }; 