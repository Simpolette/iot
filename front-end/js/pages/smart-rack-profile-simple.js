// Smart Rack Profile Page JS
const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {
  // Wait for CSS to load
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });
  loadUserProfile();
});

async function loadUserProfile() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;
  }
}

function toggleEdit() {
  const inputs = document.querySelectorAll('#profileForm input');
  const formActions = document.getElementById('formActions');
  const editBtn = document.getElementById('editBtn');
  
  const isDisabled = inputs[0].disabled;
  
  inputs.forEach(input => {
    if (input.id !== 'email') { // Email không được chỉnh sửa
      input.disabled = !isDisabled;
    }
  });
  
  if (isDisabled) {
    formActions.style.display = 'flex';
    editBtn.innerHTML = '<i class="fas fa-times"></i> Hủy';
  } else {
    formActions.style.display = 'none';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa';
  }
}

function cancelEdit() {
  loadUserProfile();
  toggleEdit();
}

document.getElementById('profileForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  const name = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone })
    });
    
    if (response.ok) {
      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showToast('Cập nhật thông tin thành công!', 'success');
      toggleEdit();
      loadUserProfile();
    } else {
      showToast('Lỗi khi cập nhật thông tin!', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Lỗi kết nối đến server!', 'error');
  } finally {
    showLoading(false);
  }
});

document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
    return;
  }
  
  const token = localStorage.getItem('token');
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (response.ok) {
      showToast('Đổi mật khẩu thành công!', 'success');
      this.reset();
    } else {
      showToast('Mật khẩu hiện tại không đúng!', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Lỗi kết nối đến server!', 'error');
  } finally {
    showLoading(false);
  }
});

function uploadAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('avatarImage').src = e.target.result;
    };
    reader.readAsDataURL(file);
    showToast('Avatar đã được cập nhật!', 'success');
  }
}

function logout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
  }
}
