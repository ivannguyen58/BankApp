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
    } else {
        console.error('Cannot find account input or name field elements');
    }
});

// Handle form submission with loading state
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.transfer-form');
    const btn = document.getElementById('transferBtn');
    
    if (form && btn) {
        form.addEventListener('submit', function(e) {
            const originalText = btn.textContent;
            
            btn.innerHTML = '<span class="loading"></span>Đang xử lý...';
            btn.disabled = true;
            
            // Reset after 5 seconds if still on page
            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }, 5000);
        });
    }
});