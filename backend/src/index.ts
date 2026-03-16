import './config/env';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import habitsRoutes from './routes/habits';
import { authMiddleware } from './middleware/auth';

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

mongoose
  .connect(mongoUri)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
  });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', authMiddleware, habitsRoutes);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server listening on port ${port}`);
});


