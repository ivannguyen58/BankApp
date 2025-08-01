const express = require('express');
const router = express.Router();
const { accountOperations, userOperations } = require('../models/database');

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

// Transfer money post
router.post('/transfer', requireAuth, (req, res) => {
    const { recipientAccount, amount, message } = req.body;
    const userAccount = accountOperations.findByUserId(req.session.user.id);
    
    const transferAmount = parseFloat(amount);
    
    const result = accountOperations.transfer(
        userAccount.id,
        recipientAccount,
        transferAmount
    );

    if (result.success) {
        res.render('banking/transfer', {
            user: req.session.user,
            account: userAccount,
            error: null,
            success: `Chuyển tiền thành công ${transferAmount.toLocaleString('vi-VN')} VNĐ`
        });
    } else {
        res.render('banking/transfer', {
            user: req.session.user,
            account: userAccount,
            error: result.message,
            success: null
        });
    }
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

// API to get account info by account number - FIX THIS
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