
import "./bootstrap/dns-override.js";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import http from 'http';
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import newsletterRoutes from './routes/newsletter.js';
import webhookRoutes from './routes/webhooks.js';
import emailRoutes from './routes/emails.js';
import emailTestRoutes from './routes/emailTests.js';
import productRoutes from './routes/products.js';
import analyticsRoutes from './routes/analytics.js';



// Load environment variables early
dotenv.config();

console.log('[startup] Environment variables loaded:');
console.log('[startup] MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('[startup] MONGO_URI length:', process.env.MONGO_URI?.length || 0);
console.log('[startup] JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('[startup] SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://savatsya-gau-samvardhan.vercel.app',
  'https://savatsya-gau-samvardhan-git-main-blankstar1233s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Ensure MONGO_URI is present but don't crash the process; log a helpful warning instead
if (!process.env.MONGO_URI) {
  console.warn("Warning: MONGO_URI not set. Database connection will not be established. Set MONGO_URI in backend/.env or environment variables.");
} else {
  // Enhanced MongoDB connection with better timeout settings
  const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    connectTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain a minimum of 5 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  };

  console.log('[database] Attempting to connect to MongoDB...');

  mongoose.connect(process.env.MONGO_URI, mongooseOptions)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
      console.log(`[database] Connected to: ${mongoose.connection.name}`);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      console.error("[database] Connection failed. Please check:");
      console.error("1. MongoDB Atlas cluster is running and not paused");
      console.error("2. Network connectivity to MongoDB Atlas");
      console.error("3. Database credentials are correct");
      console.error("4. IP address is whitelisted in MongoDB Atlas");

      // Don't exit the server, continue running without database
      console.warn("⚠️  Server continuing without database connection");
    });

  // Handle connection events
  mongoose.connection.on('disconnected', () => {
    console.warn("⚠️  MongoDB disconnected");
  });

  mongoose.connection.on('reconnected', () => {
    console.log("🔄 MongoDB reconnected");
  });

  mongoose.connection.on('error', (err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
}

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

// Static serving of frontend in production (disabled for development)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const frontendDist = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(frontendDist));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendDist, 'index.html'));
// });

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);


try {
  import('./websocket.js').then(({ attachWebsocket }) => {
    const { broadcast } = attachWebsocket(server, { path: '/ws' });

    app.locals.broadcast = broadcast;
    console.log('WebSocket server attached at /ws');
  }).catch((err) => {
    console.warn('WebSocket module not available or failed to initialize:', err?.message || err);
  });
} catch (err) {
  console.warn('WebSocket attach skipped:', err?.message || err);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
