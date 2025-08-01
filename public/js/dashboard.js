// Make functions global so they can be called from HTML
window.showNFCScreen = showNFCScreen;
window.closeNFCModal = closeNFCModal;
window.startNFCPayment = startNFCPayment;
window.closeModal = closeModal;
window.closeErrorModal = closeErrorModal;

let nfcScanning = false;

// Show NFC Modal
function showNFCScreen() {
    console.log('Showing NFC modal');
    const modal = document.getElementById('nfcModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        console.error('NFC modal not found');
    }
}

// Close NFC Modal
function closeNFCModal() {
    console.log('Closing NFC modal');
    const modal = document.getElementById('nfcModal');
    if (modal) {
        modal.classList.remove('show');
    }
    resetNFC();
}

// Start NFC Payment
function startNFCPayment() {
    console.log('Starting NFC payment');
    
    const btn = document.getElementById('startNfcBtn');
    const status = document.getElementById('nfcStatus');
    const animation = document.getElementById('nfcAnimation');
    const amount = document.getElementById('nfcAmount');
    
    if (!btn || !status || !animation || !amount) {
        console.error('NFC elements not found');
        return;
    }
    
    if (!nfcScanning) {
        nfcScanning = true;
        btn.innerHTML = '<span class="loading"></span>Đang quét...';
        btn.disabled = true;
        status.textContent = 'Đưa điện thoại gần thiết bị POS';
        animation.classList.add('scanning');
        
        // Simulate NFC detection
        setTimeout(() => {
            const randomAmount = Math.floor(Math.random() * 500000) + 50000;
            amount.textContent = randomAmount.toLocaleString('vi-VN') + ' VNĐ';
            status.textContent = 'Phát hiện thiết bị POS';
            
            setTimeout(() => {
                status.textContent = 'Đang xử lý thanh toán...';
                
                console.log('Sending payment request:', randomAmount);
                
                // Send payment request to server
                fetch('/banking/nfc-pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ amount: randomAmount })
                })
                .then(response => {
                    console.log('Payment response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Payment response:', data);
                    
                    closeNFCModal();
                    
                    if (data.success) {
                        updateBalanceDisplay(data.newBalance);
                        showSuccessModal('Thanh toán NFC thành công!', `Đã thanh toán ${randomAmount.toLocaleString('vi-VN')} VNĐ`);
                    } else {
                        showErrorModal('Thanh toán thất bại!', data.message);
                    }
                    resetNFC();
                })
                .catch(error => {
                    console.error('Payment error:', error);
                    closeNFCModal();
                    showErrorModal('Lỗi kết nối!', 'Không thể kết nối đến server');
                    resetNFC();
                });
            }, 1000);
        }, 3000);
    }
}

// Reset NFC
function resetNFC() {
    const btn = document.getElementById('startNfcBtn');
    const status = document.getElementById('nfcStatus');
    const animation = document.getElementById('nfcAnimation');
    const amount = document.getElementById('nfcAmount');
    
    if (btn && status && animation && amount) {
        nfcScanning = false;
        btn.innerHTML = 'Bắt đầu quét NFC';
        btn.disabled = false;
        status.textContent = 'Sẵn sàng thanh toán';
        animation.classList.remove('scanning');
        amount.textContent = '0 VNĐ';
    }
}

// Update balance display
function updateBalanceDisplay(newBalance) {
    const balanceElement = document.getElementById('accountBalance');
    if (balanceElement) {
        balanceElement.textContent = newBalance.toLocaleString('vi-VN') + ' VNĐ';
        
        // Add animation effect
        balanceElement.style.transform = 'scale(1.1)';
        balanceElement.style.color = '#ff6b6b';
        setTimeout(() => {
            balanceElement.style.transform = 'scale(1)';
            balanceElement.style.color = 'white';
        }, 300);
    }
}

// Modal functions
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    
    if (modal && titleEl && messageEl) {
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('show');
    }
}

function showErrorModal(title, message) {
    const modal = document.getElementById('errorModal');
    const titleEl = document.getElementById('errorModalTitle');
    const messageEl = document.getElementById('errorModalMessage');
    
    if (modal && titleEl && messageEl) {
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('show');
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // NFC Card click handler
    const nfcCard = document.getElementById('nfcCard');
    if (nfcCard) {
        nfcCard.addEventListener('click', showNFCScreen);
    }
    
    // Close modals when clicking outside
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const nfcModal = document.getElementById('nfcModal');
    
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    if (errorModal) {
        errorModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeErrorModal();
            }
        });
    }
    
    if (nfcModal) {
        nfcModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeNFCModal();
            }
        });
    }
    
    console.log('Dashboard JS loaded successfully');
});