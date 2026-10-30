import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_week7_task2_internship_demo_123456';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// In-Memory Database (Pre-seeded with demo account)
const users = [
  {
    id: 'user_demo_01',
    name: 'Alex Morgan',
    email: 'demo@example.com',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    role: 'Full-Stack Developer',
    createdAt: new Date().toISOString()
  }
];

// Helper to generate JWT
function generateToken(user, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );
}

// Authentication Middleware: Verifies Bearer Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No Authorization header provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Malformed Authorization header. Format must be: Bearer <token>'
    });
  }

  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Your session token has expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Invalid session token. Authentication failed.'
      });
    }

    // Attach decoded token payload to request
    req.user = decoded;
    next();
  });
}

// --------------------------------------------------------------------------
// Public Routes
// --------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = users.find(u => u.email === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'Member',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
});

// POST /api/auth/simulate-expired-token (Testing aid for evaluating 401 handling)
app.post('/api/auth/simulate-expired-token', (req, res) => {
  const expiredToken = jwt.sign(
    {
      sub: 'user_demo_01',
      name: 'Alex Morgan',
      email: 'demo@example.com',
      role: 'Full-Stack Developer'
    },
    JWT_SECRET,
    { expiresIn: '1ms' } // Expires immediately
  );

  setTimeout(() => {
    res.json({
      success: true,
      message: 'Generated intentionally expired token for testing 401 interceptor.',
      token: expiredToken
    });
  }, 50);
});

// --------------------------------------------------------------------------
// Protected Routes (Require valid JWT Bearer header)
// --------------------------------------------------------------------------

// GET /api/auth/me - Validates token and returns current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User account not found.'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// GET /api/dashboard/metrics - Protected dashboard metrics
app.get('/api/dashboard/metrics', authenticateToken, (req, res) => {
  res.json({
    success: true,
    metrics: {
      activeSessions: 3,
      apiRequestsToday: 142,
      securityScore: 98,
      tokenType: 'JWT (RS256/HS256 compatible)',
      tokenExpiresIn: JWT_EXPIRES_IN,
      authMethod: 'HTTP Bearer Header',
      lastLogin: new Date().toLocaleTimeString(),
      accountStatus: 'Active & Verified'
    }
  });
});

// GET /api/dashboard/activities - Protected user activity log
app.get('/api/dashboard/activities', authenticateToken, (req, res) => {
  res.json({
    success: true,
    activities: [
      {
        id: 'act_1',
        type: 'AUTH_SUCCESS',
        event: 'User logged in via credentials',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ip: '127.0.0.1'
      },
      {
        id: 'act_2',
        type: 'TOKEN_ISSUED',
        event: `Signed JWT issued (Expiry: ${JWT_EXPIRES_IN})`,
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        ip: '127.0.0.1'
      },
      {
        id: 'act_3',
        type: 'API_INTERCEPT',
        event: 'Axios attached Authorization: Bearer <token>',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1'
      }
    ]
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AUTH BACKEND] Server running at http://localhost:${PORT}`);
  console.log(`[AUTH BACKEND] Pre-seeded demo user: demo@example.com / Password123!`);
});
