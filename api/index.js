/**
 * This file is for Vercel Serverless Function deployment.
 * It imports the main Express app from the backend directory.
 */
const app = require('../backend/server');

// This is required for Vercel serverless functions
module.exports = app;
