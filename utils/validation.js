function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function validateAccountNumber(accountNumber) {
    const accountRegex = /^[0-9]{10}$/;
    return accountRegex.test(accountNumber);
}

function validateAmount(amount) {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000000;
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}

module.exports = {
    validateEmail,
    validatePhone,
    validateAccountNumber,
    validateAmount,
    sanitizeInput
};