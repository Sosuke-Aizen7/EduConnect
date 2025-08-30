import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Express } from 'express';

/**
 * General API rate limiting configuration
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Apply to API routes only
  skip: (req) => !req.path.startsWith('/api')
});

/**
 * Strict rate limiting for admin operations
 */
export const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit admin operations more strictly
  message: {
    error: 'Too many admin requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict rate limiting for scraping operations
 */
export const scrapingApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 scraping requests per hour
  message: {
    error: 'Scraping rate limit exceeded. Please wait before starting another scraping operation.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication endpoints rate limiting
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit login attempts
  message: {
    error: 'Too many authentication attempts from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security headers configuration using Helmet
 */
export function setupSecurityHeaders(app: Express) {
  // In development, use relaxed CSP for Vite
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  app.use(helmet({
    // Content Security Policy
    contentSecurityPolicy: isDevelopment ? false : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws:", "wss:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Disabled for development
    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false
    },
    // Frameguard
    frameguard: {
      action: 'deny'
    },
    // Hide Powered By
    hidePoweredBy: true,
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    // IE No Open
    ieNoOpen: true,
    // No Sniff
    noSniff: true,
    // Origin Agent Cluster
    originAgentCluster: true,
    // Permitted Cross Domain Policies
    permittedCrossDomainPolicies: false,
    // Referrer Policy
    referrerPolicy: {
      policy: ["no-referrer"]
    },
    // X-Content-Type-Options
    xssFilter: true
  }));
}

/**
 * Rate limiting configuration for different route groups
 */
export function setupRateLimiting(app: Express) {
  // Apply general rate limiting to all API routes
  app.use('/api', generalApiLimiter);
  
  // Apply stricter rate limiting to admin routes
  app.use('/api/admin', adminApiLimiter);
  
  // Apply very strict rate limiting to scraping routes
  app.use('/api/admin/scrape', scrapingApiLimiter);
  
  // Apply auth rate limiting to authentication routes
  app.use('/api/login', authLimiter);
  app.use('/api/callback', authLimiter);
  app.use('/api/logout', authLimiter);
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req: any, res: any, next: any) {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        // Remove potential script tags and normalize whitespace
        req.query[key] = req.query[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potential script tags and normalize whitespace
      obj[key] = obj[key]
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * Comprehensive security setup
 */
export function setupSecurity(app: Express) {
  // Security headers
  setupSecurityHeaders(app);
  
  // Rate limiting
  setupRateLimiting(app);
  
  // Input sanitization
  app.use(sanitizeInput);
  
  console.log('Security middleware configured successfully');
}