const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};

// CSRF protection
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Setup security middleware
function setupSecurity(app) {
    // Basic security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://api.linkedin.com', 'https://apis.indeed.com'],
                frameSrc: ["'self'", 'https://js.stripe.com'],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        }
    }));

    // Parse cookies
    app.use(cookieParser());

    // CORS
    app.use(cors(corsOptions));

    // Rate limiting
    app.use('/api/', limiter);

    // CSRF protection for non-GET requests
    app.use((req, res, next) => {
        if (req.method === 'GET') {
            next();
        } else {
            csrfProtection(req, res, next);
        }
    });

    // XSS protection
    app.use((req, res, next) => {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    // Prevent clickjacking
    app.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    });

    // Security logging middleware
    app.use((req, res, next) => {
        if (req.method !== 'GET') {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
        }
        next();
    });

    // Error handler for security middleware
    app.use((err, req, res, next) => {
        if (err.code === 'EBADCSRFTOKEN') {
            res.status(403).json({
                error: 'Invalid CSRF token',
                message: 'Form submission failed. Please try again.'
            });
        } else {
            next(err);
        }
    });
}

module.exports = setupSecurity; 