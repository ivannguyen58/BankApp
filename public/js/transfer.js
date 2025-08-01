// Check recipient account
document.addEventListener('DOMContentLoaded', function() {
    const accountInput = document.getElementById('recipientAccount');
    const nameField = document.getElementById('recipientName');
    
    if (accountInput && nameField) {
        accountInput.addEventListener('input', function(e) {
            const account = e.target.value.trim();
            
            if (account.length >= 10) {
                console.log('Looking up account:', account);
                
                // Show loading
                nameField.value = 'Đang kiểm tra...';
                nameField.style.color = '#666';
                
                // Fetch account info from server
                fetch(`/banking/api/account/${account}`)
                    .then(response => {
                        console.log('API response status:', response.status);
                        return response.json();
                    })
                    .then(data => {
                        console.log('API response:', data);
                        
                        if (data.success) {
                            nameField.value = data.accountHolder;
                            nameField.style.color = '#28a745';
                        } else {
                            nameField.value = 'Không tìm thấy tài khoản';
                            nameField.style.color = '#dc3545';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        nameField.value = 'Lỗi kiểm tra tài khoản';
                        nameField.style.color = '#dc3545';
                    });
            } else {
                nameField.value = '';
                nameField.style.color = '#666';
            }
        });
    }

    // Handle transfer form with OTP
    const form = document.querySelector('.transfer-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('transferBtn');
            const formData = new FormData(form);
            
            // Show loading
            btn.innerHTML = '<span class="loading"></span>Đang tạo OTP...';
            btn.disabled = true;
            
            // Generate OTP
            fetch('/banking/transfer/generate-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientAccount: formData.get('recipientAccount'),
                    amount: formData.get('amount'),
                    message: formData.get('message')
                })
            })
            .then(response => response.json())
            .then(data => {
                btn.innerHTML = 'Chuyển tiền';
                btn.disabled = false;
                
                if (data.success) {
                    showOTPModal(data.otpKey, data.recipientAccount, data.amount);
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                btn.innerHTML = 'Chuyển tiền';
                btn.disabled = false;
                showAlert('Lỗi kết nối server', 'error');
            });
        });
    }
});

// Show OTP Modal
function showOTPModal(otpKey, recipientAccount, amount) {
    // Create modal HTML
    const modalHTML = `
        <div id="otpModal" class="otp-modal">
            <div class="otp-modal-content">
                <div class="otp-header">
                    <h3>🔐 Xác thực OTP</h3>
                    <button class="close-btn" onclick="closeOTPModal()">&times;</button>
                </div>
                <div class="otp-body">
                    <p class="otp-info">Vui lòng nhập mã OTP để xác nhận giao dịch:</p>
                    <div class="transfer-summary">
                        <div class="summary-item">
                            <span>Số tiền:</span>
                            <strong>${amount.toLocaleString('vi-VN')} VNĐ</strong>
                        </div>
                        <div class="summary-item">
                            <span>Tài khoản nhận:</span>
                            <strong>${recipientAccount}</strong>
                        </div>
                    </div>
                    <div class="otp-input-container">
                        <input type="text" id="otpInput" class="otp-input" placeholder="Nhập mã OTP 6 số" maxlength="6">
                    </div>
                    <div class="otp-note">
                        💡 Mã OTP đã được hiển thị trong terminal/console
                    </div>
                    <div class="otp-actions">
                        <button class="otp-verify-btn" onclick="verifyOTP('${otpKey}')">Xác nhận</button>
                        <button class="otp-cancel-btn" onclick="closeOTPModal()">Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('otpInput').focus();
    }, 100);
    
    // Allow Enter key to submit
    document.getElementById('otpInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyOTP(otpKey);
        }
    });
}

// Verify OTP
function verifyOTP(otpKey) {
    const otpInput = document.getElementById('otpInput');
    const otp = otpInput.value.trim();
    
    if (!otp || otp.length !== 6) {
        showAlert('Vui lòng nhập đúng 6 số OTP', 'error');
        return;
    }
    
    const verifyBtn = document.querySelector('.otp-verify-btn');
    verifyBtn.innerHTML = '<span class="loading"></span>Đang xác minh...';
    verifyBtn.disabled = true;
    
    fetch('/banking/transfer/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            otpKey: otpKey,
            otp: otp
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeOTPModal();
            showAlert(data.message, 'success');
            
            // Update balance if provided
            if (data.newBalance) {
                updateBalance(data.newBalance);
            }
            
            // Reset form
            document.querySelector('.transfer-form').reset();
            document.getElementById('recipientName').value = '';
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = '/banking/dashboard';
            }, 2000);
        } else {
            verifyBtn.innerHTML = 'Xác nhận';
            verifyBtn.disabled = false;
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        verifyBtn.innerHTML = 'Xác nhận';
        verifyBtn.disabled = false;
        showAlert('Lỗi kết nối server', 'error');
    });
}

// Close OTP Modal
function closeOTPModal() {
    const modal = document.getElementById('otpModal');
    if (modal) {
        modal.remove();
    }
}

// Show alert message
function showAlert(message, type) {
    const alertHTML = `
        <div class="alert alert-${type}" id="alertMessage">
            ${message}
        </div>
    `;
    
    // Remove existing alert
    const existingAlert = document.getElementById('alertMessage');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Add new alert
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        const alert = document.getElementById('alertMessage');
        if (alert) {
            alert.remove();
        }
    }, 3000);
}

// Update balance
function updateBalance(newBalance) {
    const balanceElement = document.querySelector('.current-balance strong');
    if (balanceElement) {
        balanceElement.textContent = newBalance.toLocaleString('vi-VN') + ' VNĐ';
    }
}

console.log('Transfer JS with OTP loaded successfully');