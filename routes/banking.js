const express = require('express');
const router = express.Router();
const { accountOperations, userOperations } = require('../models/database');

// Store OTP temporarily (in production, use Redis or database)
const otpStore = {};

// Generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Dashboard
router.get('/dashboard', requireAuth, (req, res) => {
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    res.render('banking/dashboard', { 
        user: req.session.user,
        account: userAccount
    });
});

// Transfer money page
router.get('/transfer', requireAuth, (req, res) => {
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    res.render('banking/transfer', { 
        user: req.session.user,
        account: userAccount,
        error: null,
        success: null
    });
});

// Generate OTP for transfer
router.post('/transfer/generate-otp', requireAuth, (req, res) => {
    const { recipientAccount, amount, message } = req.body;
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    
    const transferAmount = parseFloat(amount);
    
    // Validate transfer data
    if (!recipientAccount || !amount) {
        return res.json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin'
        });
    }
    
    if (transferAmount <= 0) {
        return res.json({
            success: false,
            message: 'Số tiền không hợp lệ'
        });
    }
    
    if (userAccount.balance < transferAmount) {
        return res.json({
            success: false,
            message: 'Số dư không đủ'
        });
    }
    
    const recipientAcc = accountOperations.findByAccountNumber(recipientAccount);
    if (!recipientAcc) {
        return res.json({
            success: false,
            message: 'Tài khoản người nhận không tồn tại'
        });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpKey = `${req.session.user.id}_${Date.now()}`;
    
    // Store OTP with transfer data
    otpStore[otpKey] = {
        otp: otp,
        userId: req.session.user.id,
        recipientAccount: recipientAccount,
        amount: transferAmount,
        message: message || '',
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    // Display OTP in terminal with colors
    console.log('\n' + '='.repeat(50));
    console.log('🔐 VIETBANK OTP VERIFICATION');
    console.log('='.repeat(50));
    console.log(`👤 User: ${req.session.user.fullName} (${req.session.user.username})`);
    console.log(`💰 Amount: ${transferAmount.toLocaleString('vi-VN')} VNĐ`);
    console.log(`📤 To: ${recipientAccount}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Valid for: 5 minutes`);
    console.log('='.repeat(50) + '\n');
    
    res.json({
        success: true,
        message: 'OTP đã được gửi! Kiểm tra terminal để lấy mã OTP.',
        otpKey: otpKey,
        recipientAccount: recipientAccount,
        amount: transferAmount
    });
});

// Verify OTP and execute transfer
router.post('/transfer/verify-otp', requireAuth, (req, res) => {
    const { otpKey, otp } = req.body;
    
    if (!otpStore[otpKey]) {
        return res.json({
            success: false,
            message: 'OTP không hợp lệ hoặc đã hết hạn'
        });
    }
    
    const otpData = otpStore[otpKey];
    
    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
        delete otpStore[otpKey];
        return res.json({
            success: false,
            message: 'OTP đã hết hạn'
        });
    }
    
    // Check if OTP matches
    if (otpData.otp !== otp.trim()) {
        console.log(`❌ Invalid OTP attempt: ${otp} (Expected: ${otpData.otp})`);
        return res.json({
            success: false,
            message: 'Mã OTP không đúng'
        });
    }
    
    // Check if user matches
    if (otpData.userId !== req.session.user.id) {
        delete otpStore[otpKey];
        return res.json({
            success: false,
            message: 'OTP không hợp lệ'
        });
    }
    
    // Execute transfer
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    const result = accountOperations.transfer(
        userAccount.id,
        otpData.recipientAccount,
        otpData.amount
    );
    
    // Clean up OTP
    delete otpStore[otpKey];
    
    if (result.success) {
        console.log(`✅ Transfer completed: ${otpData.amount.toLocaleString('vi-VN')} VNĐ`);
        console.log(`   From: ${req.session.user.fullName}`);
        console.log(`   To: ${otpData.recipientAccount}`);
        console.log('='.repeat(50) + '\n');
        
        res.json({
            success: true,
            message: `Chuyển tiền thành công ${otpData.amount.toLocaleString('vi-VN')} VNĐ`,
            newBalance: result.fromBalance
        });
    } else {
        res.json({
            success: false,
            message: result.message
        });
    }
});

// Transfer money post (old method - now redirects to OTP)
router.post('/transfer', requireAuth, (req, res) => {
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    res.render('banking/transfer', {
        user: req.session.user,
        account: userAccount,
        error: 'Vui lòng sử dụng phương thức xác thực OTP',
        success: null
    });
});

// NFC Payment API
router.post('/nfc-pay', requireAuth, (req, res) => {
    const { amount } = req.body;
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    const paymentAmount = parseFloat(amount);

    console.log(`NFC Payment request: ${paymentAmount} VND for user ${req.session.user.username}`);

    if (userAccount.balance >= paymentAmount) {
        const newBalance = userAccount.balance - paymentAmount;
        accountOperations.updateBalance(userAccount.id, newBalance);
        
        console.log(`✅ NFC Payment successful: ${paymentAmount} VND, new balance: ${newBalance}`);
        
        res.json({ 
            success: true, 
            message: 'Thanh toán NFC thành công',
            newBalance: newBalance
        });
    } else {
        console.log(`❌ NFC Payment failed: insufficient balance`);
        res.json({ 
            success: false, 
            message: 'Số dư không đủ' 
        });
    }
});

// API to get account info by account number
router.get('/api/account/:accountNumber', requireAuth, (req, res) => {
    console.log(`Looking up account: ${req.params.accountNumber}`);
    
    const account = accountOperations.findByAccountNumber(req.params.accountNumber);
    
    if (account) {
        const user = userOperations.findById(account.userId);
        console.log(`✅ Found account: ${user.fullName}`);
        
        res.json({
            success: true,
            accountHolder: user.fullName
        });
    } else {
        console.log(`❌ Account not found: ${req.params.accountNumber}`);
        res.json({
            success: false,
            message: 'Tài khoản không tồn tại'
        });
    }
});

module.exports = router;