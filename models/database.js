const bcrypt = require('bcryptjs');

// In-memory database (replace with real database in production)
let users = [];
let accounts = [];

// Initialize with sample data
function initializeDatabase() {
    // Create sample users
    const sampleUsers = [
        {
            id: '1',
            username: 'user1',
            password: 'password123',
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            phone: '0123456789'
        },
        {
            id: '2',
            username: 'user2',
            password: 'password123',
            fullName: 'Trần Thị B',
            email: 'tranthib@email.com',
            phone: '0987654321'
        },
        {
            id: '3',
            username: 'admin',
            password: 'admin123',
            fullName: 'Admin User',
            email: 'admin@vietbank.com',
            phone: '0111222333'
        }
    ];

    // Hash passwords and create users
    sampleUsers.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        users.push({
            ...user,
            password: hashedPassword,
            createdAt: new Date()
        });
    });

    // Create sample accounts
    accounts.push(
        {
            id: '1',
            userId: '1',
            accountNumber: '1234567890',
            balance: 2458000,
            accountType: 'savings',
            createdAt: new Date()
        },
        {
            id: '2',
            userId: '2',
            accountNumber: '0987654321',
            balance: 1850000,
            accountType: 'savings',
            createdAt: new Date()
        },
        {
            id: '3',
            userId: '3',
            accountNumber: '1111222333',
            balance: 50000000,
            accountType: 'current',
            createdAt: new Date()
        }
    );

    console.log('✅ Database initialized with sample data');
}

// User operations
const userOperations = {
    findByUsername: (username) => {
        return users.find(user => user.username === username);
    },

    findById: (id) => {
        return users.find(user => user.id === id);
    },

    create: (userData) => {
        const newUser = {
            id: (users.length + 1).toString(),
            ...userData,
            password: bcrypt.hashSync(userData.password, 10),
            createdAt: new Date()
        };
        users.push(newUser);
        return newUser;
    },

    validatePassword: (plainPassword, hashedPassword) => {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    }
};

// Account operations
const accountOperations = {
    findByUserId: (userId) => {
        return accounts.find(account => account.userId === userId);
    },

    findByAccountNumber: (accountNumber) => {
        return accounts.find(account => account.accountNumber === accountNumber);
    },

    updateBalance: (accountId, newBalance) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
            account.balance = newBalance;
            return account;
        }
        return null;
    },

    transfer: (fromAccountId, toAccountNumber, amount) => {
        const fromAccount = accounts.find(acc => acc.id === fromAccountId);
        const toAccount = accounts.find(acc => acc.accountNumber === toAccountNumber);

        if (!fromAccount || !toAccount) {
            return { success: false, message: 'Tài khoản không tồn tại' };
        }

        if (fromAccount.balance < amount) {
            return { success: false, message: 'Số dư không đủ' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Số tiền không hợp lệ' };
        }

        // Perform transfer
        fromAccount.balance -= amount;
        toAccount.balance += amount;

        return { 
            success: true, 
            message: 'Chuyển tiền thành công',
            fromBalance: fromAccount.balance,
            toBalance: toAccount.balance
        };
    },

    getAll: () => accounts
};

module.exports = {
    initializeDatabase,
    userOperations,
    accountOperations
};