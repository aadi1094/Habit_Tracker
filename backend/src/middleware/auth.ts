import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT secret is not configured on server' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { userId: string };
    req.user = { id: payload.userId };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

