import type { Request, Response, NextFunction } from 'express';

// Admin user configuration - in production, this should be stored securely
const ADMIN_USERS = [
  'admin@educonnect.com',
  'super@educonnect.com'
];

export interface AdminRequest extends Request {
  user?: any; // Use any to match the existing auth system
}

/**
 * Middleware to check if user is authenticated as admin
 */
export function isAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.user || !req.user.claims) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'UNAUTHORIZED' 
    });
  }

  const userEmail = req.user.claims.email;
  
  // Check if user email is in admin list
  if (!userEmail || !ADMIN_USERS.includes(userEmail.toLowerCase())) {
    return res.status(403).json({ 
      message: 'Admin access required',
      error: 'FORBIDDEN' 
    });
  }

  next();
}

/**
 * Middleware to check if user is super admin (highest level)
 */
export function isSuperAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.claims) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'UNAUTHORIZED' 
    });
  }

  const userEmail = req.user.claims.email;
  
  // Only super@educonnect.com has super admin access
  if (userEmail !== 'super@educonnect.com') {
    return res.status(403).json({ 
      message: 'Super admin access required',
      error: 'FORBIDDEN' 
    });
  }

  next();
}

/**
 * Get admin user info
 */
export function getAdminInfo(req: AdminRequest): {
  userId: string;
  email?: string;
  name?: string;
  isSuperAdmin: boolean;
} {
  const user = req.user!;
  
  return {
    userId: user.claims.sub,
    email: user.claims.email,
    name: user.claims.name,
    isSuperAdmin: user.claims.email === 'super@educonnect.com'
  };
}

/**
 * Validates admin permissions for specific actions
 */
export function hasAdminPermission(email: string | undefined, action: 'read' | 'write' | 'delete' | 'scrape'): boolean {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase();
  
  // Super admin has all permissions
  if (normalizedEmail === 'super@educonnect.com') {
    return true;
  }
  
  // Regular admin has read and write permissions
  if (ADMIN_USERS.includes(normalizedEmail)) {
    return action === 'read' || action === 'write' || action === 'scrape';
  }
  
  return false;
}

/**
 * Middleware to check specific admin permissions
 */
export function requireAdminPermission(action: 'read' | 'write' | 'delete' | 'scrape') {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    const userEmail = req.user?.claims.email;
    
    if (!hasAdminPermission(userEmail, action)) {
      return res.status(403).json({ 
        message: `Insufficient permissions for ${action} action`,
        error: 'INSUFFICIENT_PERMISSIONS' 
      });
    }
    
    next();
  };
}