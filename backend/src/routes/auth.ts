import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email }).exec();
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ email, passwordHash });

  return res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT secret is not configured on server' });
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

  return res.json({
    token,
    user: { id: user.id, email: user.email },
  });
});

router.get('/me', (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.json({ id: req.user.id });
});

export default router;

