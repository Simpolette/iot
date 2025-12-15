// Smart Rack Signup Page JS
const API_URL = 'http://localhost:8080/api';

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const iconId = fieldId === 'password' ? 'toggleIconPassword' : 'toggleIconConfirm';
  const icon = document.getElementById(iconId);
  
  if (field.type === 'password') {
    field.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    field.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function checkPasswordStrength(password) {
  const strengthDiv = document.getElementById('passwordStrength');
  let strength = 'weak';
  
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 6) {
    strength = 'medium';
  }
  
  strengthDiv.className = `password-strength ${strength}`;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = show ? 'flex' : 'none';
}

document.getElementById('password').addEventListener('input', function(e) {
  checkPasswordStrength(e.target.value);
});

let currentEmail = '';

document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const terms = document.getElementById('terms').checked;
  
  if (!terms) {
    showToast('Vui lòng đồng ý với điều khoản sử dụng!', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentEmail = email;
      showToast('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực 6 số.', 'success');
      
      // Show verification modal
      document.getElementById('emailDisplay').textContent = email;
      document.getElementById('verificationModal').style.display = 'flex';
    } else {
      showToast(data.message || 'Đăng ký thất bại!', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Lỗi kết nối đến server!', 'error');
  } finally {
    showLoading(false);
  }
});

document.getElementById('verifyBtn').addEventListener('click', async function() {
  const code = document.getElementById('verificationCode').value;
  
  if (!code || code.length !== 6) {
    showToast('Vui lòng nhập mã 6 số!', 'error');
    return;
  }
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: currentEmail, 
        code: code 
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Xác thực thành công! Chuyển đến trang đăng nhập...', 'success');
      
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      showToast(data.message || 'Mã xác thực không đúng hoặc đã hết hạn!', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Lỗi kết nối đến server!', 'error');
  } finally {
    showLoading(false);
  }
});

// Resend code
document.getElementById('resendCode').addEventListener('click', async function(e) {
  e.preventDefault();
  showToast('Chức năng gửi lại mã sẽ được cập nhật sau!', 'error');
});
