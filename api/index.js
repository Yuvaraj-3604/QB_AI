/**
 * Vercel Serverless Function entry point.
 * This file uses CommonJS (api/package.json overrides root "type":"module").
 * It imports the Express app from the backend directory.
 */
'use strict';

const app = require('../backend/server');

module.exports = app;
