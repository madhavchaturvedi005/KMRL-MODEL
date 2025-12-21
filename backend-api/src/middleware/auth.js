import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid authorization token'
    });
  }

  try {
    // For development/testing, we'll accept a simple token format
    // In production, you'd verify against your actual JWT secret
    if (token === 'mock-token' || token.startsWith('mock-')) {
      // Mock user for testing
      req.user = {
        id: 'mock-admin-id',
        email: 'admin@kmrl.com',
        name: 'System Administrator',
        role: 'admin'
      };
      return next();
    }

    // Try to verify as JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();

  } catch (error) {
    logger.warn('Token verification failed:', error.message);
    
    // For development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      // Allow any token in development
      req.user = {
        id: 'dev-user-id',
        email: 'dev@kmrl.com',
        name: 'Development User',
        role: 'user'
      };
      return next();
    }

    return res.status(403).json({
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This endpoint requires administrator privileges'
    });
  }

  next();
};

/**
 * Optional authentication - sets user if token is valid, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token, continue without user
  }

  try {
    if (token === 'mock-token' || token.startsWith('mock-')) {
      req.user = {
        id: 'mock-admin-id',
        email: 'admin@kmrl.com',
        name: 'System Administrator',
        role: 'admin'
      };
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();

  } catch (error) {
    // Invalid token, but continue without user
    logger.warn('Optional auth token verification failed:', error.message);
    next();
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    jwtSecret,
    { expiresIn }
  );
};

/**
 * Middleware to log authentication attempts
 */
export const logAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const hasToken = !!authHeader;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;

  logger.info(`Auth attempt: ${req.method} ${req.path}`, {
    hasToken,
    userAgent,
    ip,
    timestamp: new Date().toISOString()
  });

  next();
};