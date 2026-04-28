import "./bootstrap/dns-override.js";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import http from 'http';
import cors from "cors";
import helmet from "helmet";
import cookieParser from 'cookie-parser';
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import newsletterRoutes from './routes/newsletter.js';
import webhookRoutes from './routes/webhooks.js';
import emailRoutes from './routes/emails.js';
import emailTestRoutes from './routes/emailTests.js';
import productRoutes from './routes/products.js';
import analyticsRoutes from './routes/analytics.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contact.js';
import { connectDatabase } from './config/db.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Load environment variables early
dotenv.config();

logger.info('startup', 'Environment loaded', {
  MONGO_URI: !!process.env.MONGO_URI,
  JWT_SECRET: !!process.env.JWT_SECRET,
  SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
});

const app = express();

// --- CORS origins via environment variable ---
const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...envOrigins,
].filter(Boolean);

app.use(helmet());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limiting for auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn('cors', `Blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Simple request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('http', `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint (checks DB connectivity)
app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const status = dbReady ? 'OK' : 'DEGRADED';
  const statusCode = dbReady ? 200 : 503;
  res.status(statusCode).json({
    status,
    message: dbReady ? 'Server is running' : 'Server running but database not connected',
    database: dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API routes — auth routes get stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/email-tests', emailTestRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Global error handler — must be registered AFTER all routes
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

let wsModule = null;

async function startServer() {
  // Await database connection before starting server
  await connectDatabase();

  // Attach WebSocket
  try {
    const { attachWebsocket } = await import('./websocket.js');
    wsModule = attachWebsocket(server, { path: '/ws' });
    app.locals.broadcast = wsModule.broadcast;
    logger.info('websocket', 'WebSocket server attached at /ws');
  } catch (err) {
    logger.warn('websocket', 'WebSocket module not available', { error: err?.message });
  }

  server.listen(PORT, () => logger.info('startup', `Server running on port ${PORT}`));
}

// Graceful shutdown
function gracefulShutdown(signal) {
  logger.info('shutdown', `${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info('shutdown', 'HTTP server closed');

    if (wsModule?.close) {
      wsModule.close();
      logger.info('shutdown', 'WebSocket server closed');
    }

    mongoose.connection.close(false).then(() => {
      logger.info('shutdown', 'MongoDB connection closed');
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    });
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    logger.error('shutdown', 'Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer().catch(err => {
  logger.error('startup', 'Failed to start server', { error: err.message });
  process.exit(1);
});
