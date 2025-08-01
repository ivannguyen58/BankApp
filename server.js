const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database first
const { initializeDatabase } = require('./models/database');
initializeDatabase();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: 'vietbank-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Import routes AFTER middleware setup
const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');

// Routes
app.use('/auth', authRoutes);
app.use('/banking', bankingRoutes);

// Home route
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/banking/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// Test route to verify server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Trang không tồn tại',
        user: req.session.user 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Đã có lỗi xảy ra',
        user: req.session.user 
    });
});

app.listen(PORT, () => {
    console.log(`🏦 VietBank Mobile đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Test endpoint: http://localhost:${PORT}/test`);
    console.log(`🔐 Login page: http://localhost:${PORT}/auth/login`);
});