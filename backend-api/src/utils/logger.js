import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure logs directory exists
const ensureLogsDirectory = () => {
  const logsDir = 'logs';
  if (!existsSync(logsDir)) {
    try {
      mkdirSync(logsDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create logs directory:', error.message);
      return false;
    }
  }
  return true;
};

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport (always available)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Add file transports only if logs directory is available
const canWriteLogs = ensureLogsDirectory();
if (canWriteLogs) {
  transports.push(
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
} else {
  console.warn('File logging disabled - using console only');
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add request logging helper
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel](`${method} ${url} ${statusCode} ${duration}ms - ${ip}`);
  });
  
  next();
};

// Add error logging helper
logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip
    };
  }
  
  logger.error('Application Error:', errorInfo);
};

// Add performance logging helper
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation} completed in ${duration}ms`, {
    operation,
    duration,
    ...metadata
  });
};

// Add security logging helper
logger.logSecurity = (event, details = {}) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export { logger };
export default logger;