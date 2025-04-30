import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin'; // You'll need to create this

interface DecodedToken {
  userId: string;
  email: string;
  organizationId?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'No authentication token provided' });
    return;
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      organizationId: decodedToken.organizationId,
      role: decodedToken.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;