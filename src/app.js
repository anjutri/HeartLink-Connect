const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const testRoute = require('./routes/test');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS : '*'
}));
app.use(helmet({
  contentSecurityPolicy: false // This allows loading of external resources
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve static files - this should come before routes
app.use(express.static(path.join(__dirname, 'public'), {
    etag: true, // Enable ETag
    lastModified: true, // Enable Last-Modified
    maxAge: '1h' // Cache for 1 hour
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Update the route handling
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/kindness-map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kindness-map.html'));
});

app.get('/stories', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stories.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Update the auth middleware section
app.use((req, res, next) => {
    // Skip auth check for static files and public routes
    const publicPaths = [
        '/login', 
        '/register', 
        '/', 
        '/about', 
        '/kindness-map', 
        '/stories', 
        '/css', 
        '/js', 
        '/images'
    ];

    if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    // For API routes, check Authorization header
    if (req.path.startsWith('/api/')) {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return next();
    }

    // For protected pages, check if user is authenticated
    const token = req.headers.authorization;
    if (!token) {
        return res.redirect('/login');
    }
    next();
});

// Apply rate limiting to all routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Additional rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // limit each IP to 5 login attempts per hour
});

app.use('/api/auth/login', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/test', testRoute);

// Catch-all route for client-side routing
app.get('*', (req, res) => {
    // Check if the route is an API route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    // For non-API routes, serve the appropriate HTML file or 404
    const publicPath = path.join(__dirname, 'public');
    const filePath = path.join(publicPath, req.path === '/' ? 'index.html' : `${req.path}.html`);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(publicPath, '404.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: process.env.NODE_ENV === 'production' ? 
                'Something went wrong!' : 
                err.message
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
}); 