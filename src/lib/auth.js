import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from './dbConnect';


import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/authOptions";

/**
 @returns {Promise<Object|null>} User object or null if not authenticated
 */
 

export async function getServerSideUser() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    
    // Get token from cookie store
    const token = cookieStore.get('auth-token')?.value;

   if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          return {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            photoUrl: user.photoUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        }
      } catch (e) {
        // Token invalid, fall through to NextAuth check
      }
    }
    

    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {

      const user = await User.findOne({ email: session.user.email }).select('-password');
    if (user) {
        return {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          photoUrl: user.photoUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Server auth check failed:', error);

    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid JWT token');
    } else if (error.name === 'TokenExpiredError') {
      console.error('JWT token expired');
    } else if (error.name === 'MongooseError') {
      console.error('Database error during auth check');
    }
    
    return null;
  }
}

/**
 * Helper to keep return object consistent
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object
 */
function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Verify JWT token from request headers or cookies
 * Useful for API routes that need manual token verification
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} Decoded token payload
 */
export async function verifyToken(request) {
  let token;
  
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie - now properly awaited
    const cookieStore = await cookies();
    token = cookieStore.get('auth-token')?.value;
  }
  
  if (!token) {
    throw new AuthError('No token provided', 401);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('Token expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AuthError('Invalid token', 401);
    }
    throw new AuthError('Token verification failed', 401);
  }
}

/**
 * Alternative version of verifyToken that works with request.cookies (for API routes)
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} Decoded token payload
 */
export async function verifyTokenFromRequest(request) {
  let token;
  
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Get from request cookies (this works in API routes)
    token = request.cookies.get('auth-token')?.value;
  }
  
  if (!token) {
    throw new AuthError('No token provided', 401);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('Token expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AuthError('Invalid token', 401);
    }
    throw new AuthError('Token verification failed', 401);
  }
}

/**
 * Higher-order function that creates authentication middleware
 * for API routes and server actions
 * @param {Array} allowedRoles - Array of roles that can access the resource
 * @returns {Function} Authentication middleware function
 */
export function requireAuth(allowedRoles = []) {
  return async function authMiddleware(request) {
    const user = await getServerSideUser();
    
    if (!user) {
      throw new AuthError('Authentication required', 401);
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new AuthError('Insufficient permissions', 403);
    }
    
    return user;
  };
}

/**
 * Custom Auth Error class for better error handling
 */
export class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Middleware wrapper for API routes that need authentication
 * Supports both JWT and NextAuth authentication strategies
 * Usage: export const POST = withAuth(async (request, { user }) => { ... })
 * @param {Function} handler - API route handler
 * @param {Object} options - Options object
 * @param {Array} options.allowedRoles - Roles allowed to access this route
 * @returns {Function} Wrapped API route handler
 */
export function withAuth(handler, options = {}) {
  return async function wrappedHandler(request, context = {}) {
    try {
      let user = null;
      
      // --- STRATEGY 1: Try Custom JWT First ---
      try {
        const decoded = await verifyTokenFromRequest(request);
        await connectDB();
        const dbUser = await User.findById(decoded.userId).select('-password');
        if (dbUser) {
          user = sanitizeUser(dbUser);
        }
      } catch (jwtError) {
        // JWT failed, try NextAuth
      }
      
      // --- STRATEGY 2: Fall back to NextAuth Session ---
      if (!user) {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email }).select('-password');
          if (dbUser) {
            user = sanitizeUser(dbUser);
          }
        }
      }
      
      // If no user found with either strategy
      if (!user) {
        return Response.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Check role permissions
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        if (!options.allowedRoles.includes(user.role)) {
          return Response.json(
            { message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }
      
      // Add user to the context
      const enhancedContext = {
        ...context,
        user,
        params: context.params || {}
      };
      
      return await handler(request, enhancedContext);
    } catch (error) {
      if (error instanceof AuthError) {
        return Response.json(
          { message: error.message },
          { status: error.statusCode }
        );
      }
      
      console.error('Auth middleware error:', error);
      return Response.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Check if user has specific role(s)
 * @param {Object} user - User object
 * @param {string|Array} roles - Role or array of roles to check
 * @returns {boolean} True if user has one of the specified roles
 */
export function hasRole(user, roles) {
  if (!user || !user.role) {
    return false;
  }
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(user.role);
}

/**
 * Check if user is an admin
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user) {
  return hasRole(user, 'admin');
}

/**
 * Check if user is a treasurer
 * @param {Object} user - User object
 * @returns {boolean} True if user is treasurer
 */
export function isTreasurer(user) {
  return hasRole(user, 'treasurer');
}

/**
 * Check if user has elevated privileges (admin or treasurer)
 * @param {Object} user - User object
 * @returns {boolean} True if user has elevated privileges
 */
export function hasElevatedPrivileges(user) {
  return hasRole(user, ['admin', 'treasurer']);
}

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} JWT token
 */
export function generateToken(user, expiresIn = '7d') {
  return jwt.sign(
    {
      userId: user._id || user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Get user permissions based on role
 * @param {Object} user - User object
 * @returns {Object} Permissions object
 */
export function getUserPermissions(user) {
  if (!user) {
    return {
      canViewDashboard: false,
      canEditProfile: false,
      canAccessAdmin: false,
      canManageUsers: false,
      canViewReports: false,
      canManageFinances: false,
    };
  }

  const basePermissions = {
    canViewDashboard: true,
    canEditProfile: true,
    canAccessAdmin: false,
    canManageUsers: false,
    canViewReports: false,
    canManageFinances: false,
  };

  if (user.role === 'admin') {
    return {
      ...basePermissions,
      canAccessAdmin: true,
      canManageUsers: true,
      canViewReports: true,
      canManageFinances: true,
    };
  }

  if (user.role === 'treasurer') {
    return {
      ...basePermissions,
      canViewReports: true,
      canManageFinances: true,
    };
  }

  return basePermissions;
}