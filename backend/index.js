
import "./bootstrap/dns-override.js";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import http from 'http';
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn('cors', `Blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to database (extracted to config/db.js)
connectDatabase();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/email-tests', emailTestRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);

// Global error handler — must be registered AFTER all routes
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);


try {
  import('./websocket.js').then(({ attachWebsocket }) => {
    const { broadcast } = attachWebsocket(server, { path: '/ws' });

    app.locals.broadcast = broadcast;
    logger.info('websocket', 'WebSocket server attached at /ws');
  }).catch((err) => {
    logger.warn('websocket', 'WebSocket module not available', { error: err?.message });
  });
} catch (err) {
  logger.warn('websocket', 'WebSocket attach skipped', { error: err?.message });
}

server.listen(PORT, () => logger.info('startup', `Server running on port ${PORT}`));
