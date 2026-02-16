import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
};

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Logs lifecycle events (connected, disconnected, reconnected, error).
 * Does NOT crash the process on failure — the server continues without a DB.
 */
export async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    logger.warn('database', 'MONGO_URI not set — skipping database connection.');
    return;
  }

  logger.info('database', 'Attempting to connect to MongoDB…');

  try {
    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    logger.info('database', `Connected to: ${mongoose.connection.name}`);
  } catch (err) {
    logger.error('database', 'Connection failed', { error: err.message });
    logger.warn('database', 'Server continuing without database connection.');
  }

  // Lifecycle events
  mongoose.connection.on('disconnected', () => {
    logger.warn('database', 'MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('database', 'MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('database', 'MongoDB error', { error: err.message });
  });
}
