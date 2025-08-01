const express = require('express');
const router = express.Router();

// Import database operations
const { userOperations, accountOperations } = require('../models/database');

// Login page
router.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/banking/dashboard');
    }
    res.render('auth/login', { error: null });
});

// Login post
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = userOperations.findByUsername(username);
    if (!user || !userOperations.validatePassword(password, user.password)) {
        return res.render('auth/login', { 
            error: 'Tên đăng nhập hoặc mật khẩu không đúng' 
        });
    }

    // Create session
    req.session.user = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
    };

    res.redirect('/banking/dashboard');
});

// Register page
router.get('/register', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/banking/dashboard');
    }
    res.render('auth/register', { error: null });
});

// Register post
router.post('/register', (req, res) => {
    const { username, password, fullName, email, phone } = req.body;

    // Check if user exists
    if (userOperations.findByUsername(username)) {
        return res.render('auth/register', { 
            error: 'Tên đăng nhập đã tồn tại' 
        });
    }

    // Create user
    const newUser = userOperations.create({
        username,
        password,
        fullName,
        email,
        phone
    });

    // Create account for new user
    const accounts = accountOperations.getAll();
    const newAccountNumber = (1000000000 + accounts.length + 1).toString();
    
    accounts.push({
        id: (accounts.length + 1).toString(),
        userId: newUser.id,
        accountNumber: newAccountNumber,
        balance: 1000000,
        accountType: 'savings',
        createdAt: new Date()
    });

    // Create session
    req.session.user = {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone
    };

    res.redirect('/banking/dashboard');
});

// Logout
router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/auth/login');
        });
    } else {
        res.redirect('/auth/login');
    }
});

module.exports = router;