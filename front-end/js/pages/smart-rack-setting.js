// Smart Rack Setting Page JS
const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {
  // Wait for CSS to load
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });
  loadSettings();
  // Initialize auto mode visibility
  toggleAutoMode();
});

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.add('active');
  event.target.closest('.tab-btn').classList.add('active');
}

function updateValue(sensor, value) {
  document.getElementById(`${sensor}Value`).textContent = value;
}

// Gửi cấu hình đến ESP32 qua MQTT
async function sendConfigToESP32(token, settings) {
  const espConfig = {
    autoMode: settings.autoModeEnabled,
    useHumidity: settings.useHumidityForAuto || false,
    autoCloseHumid: settings.autoCloseHumidity,
    useRain: settings.useRainForAuto || false,
    nightRetract: settings.nightRetract || false,
    buzzer: settings.buzzerEnabled || false
  };
  
  const response = await fetch(`${API_URL}/esp32/config`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(espConfig)
  });
  
  return response;
}

function toggleAutoMode() {
  const autoModeEnabled = document.getElementById('autoModeEnabled').checked;
  const autoModeSettings = document.getElementById('autoModeSettings');
  
  // Ẩn/hiện toàn bộ các cài đặt phụ trợ của chế độ tự động
  if (autoModeSettings) {
    if (autoModeEnabled) {
      autoModeSettings.style.display = 'block';
    } else {
      autoModeSettings.style.display = 'none';
    }
  }
}

async function loadSettings() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    console.error('User not found in localStorage');
    return;
  }
  
  const user = JSON.parse(userStr);
  const userEmail = user.email;
  
  try {
    const response = await fetch(`${API_URL}/settings/${userEmail}/get`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const settingsArray = await response.json();
      const settings = settingsArray[0] || {}; // Lấy setting đầu tiên
      
      // Load auto mode enabled
      if (settings.autoModeEnabled !== undefined) {
        document.getElementById('autoModeEnabled').checked = settings.autoModeEnabled;
        toggleAutoMode();
      }
      
      // Load humidity threshold
      if (settings.autoCloseHumidity !== undefined) {
        document.getElementById('humidityThreshold').value = settings.autoCloseHumidity;
        updateValue('humidity', settings.autoCloseHumidity);
      }
      
      // Load use humidity for auto
      if (settings.useHumidityForAuto !== undefined) {
        const tempEl = document.getElementById('tempEnabled');
        if (tempEl) tempEl.checked = settings.useHumidityForAuto;
      }
      
      // Load use rain sensor for auto
      if (settings.useRainForAuto !== undefined) {
        const rainEl = document.getElementById('rainEnabled');
        if (rainEl) rainEl.checked = settings.useRainForAuto;
      }
      
      // Load buzzer enabled
      if (settings.buzzerEnabled !== undefined) {
        const buzzerEnabledEl = document.getElementById('buzzerEnabled');
        if (buzzerEnabledEl) buzzerEnabledEl.checked = settings.buzzerEnabled;
      }
      
      // Load night retract
      if (settings.nightRetract !== undefined) {
        const nightRetractEl = document.getElementById('nightRetract');
        if (nightRetractEl) nightRetractEl.checked = settings.nightRetract;
      }
      
      // Load enable notifications
      if (settings.enableNotifications !== undefined) {
        const emailEl = document.getElementById('emailEnabled');
        if (emailEl) emailEl.checked = settings.enableNotifications;
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveCustomizeSettings() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    console.error('User not found in localStorage');
    showToast('Lỗi: Không tìm thấy thông tin người dùng!', 'error');
    return;
  }
  
  const user = JSON.parse(userStr);
  const userEmail = user.email;
  
  const settings = {
    autoModeEnabled: document.getElementById('autoModeEnabled').checked,
    autoCloseHumidity: parseInt(document.getElementById('humidityThreshold').value)
  };
  
  // Thêm các trường tùy chọn nếu tồn tại
  const tempEl = document.getElementById('tempEnabled');
  if (tempEl) {
    settings.useHumidityForAuto = tempEl.checked;
  }
  
  const rainEl = document.getElementById('rainEnabled');
  if (rainEl) {
    settings.useRainForAuto = rainEl.checked;
  }
  
  const buzzerEnabledEl = document.getElementById('buzzerEnabled');
  if (buzzerEnabledEl) {
    settings.buzzerEnabled = buzzerEnabledEl.checked;
  }
  
  const nightRetractEl = document.getElementById('nightRetract');
  if (nightRetractEl) {
    settings.nightRetract = nightRetractEl.checked;
  }
  
  const emailEl = document.getElementById('emailEnabled');
  if (emailEl) {
    settings.enableNotifications = emailEl.checked;
  }
  
  showLoading(true);
  
  try {
    // Gọi ĐỒNG THỜI cả 2 API: Lưu database VÀ Gửi đến ESP32
    const [dbResponse, espResponse] = await Promise.all([
      // 1. Lưu vào database
      fetch(`${API_URL}/settings/${userEmail}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      }),
      // 2. Gửi config đến ESP32 qua MQTT
      sendConfigToESP32(token, settings)
    ]);
    
    // Kiểm tra kết quả
    if (dbResponse.ok && espResponse.ok) {
      showToast('✅ Đã lưu cài đặt và gửi đến thiết bị thành công!', 'success');
      // Reload settings sau khi lưu thành công để đồng bộ UI
      setTimeout(() => loadSettings(), 500);
    } else if (dbResponse.ok && !espResponse.ok) {
      showToast('⚠️ Đã lưu cài đặt nhưng không gửi được đến thiết bị!', 'warning');
      console.error('ESP32 response not ok:', await espResponse.text());
      setTimeout(() => loadSettings(), 500);
    } else if (!dbResponse.ok && espResponse.ok) {
      showToast('⚠️ Đã gửi đến thiết bị nhưng lưu database thất bại!', 'warning');
      console.error('Database response not ok:', await dbResponse.text());
    } else {
      showToast('❌ Lỗi khi lưu cài đặt và gửi đến thiết bị!', 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('❌ Lỗi kết nối đến server!', 'error');
  } finally {
    showLoading(false);
  }
}

function resetToDefault() {
  if (confirm('Bạn có chắc muốn đặt lại về cài đặt mặc định?')) {
    document.getElementById('humidityThreshold').value = 70;
    updateValue('humidity', 70);
    document.getElementById('autoModeEnabled').checked = true;
    document.getElementById('rainEnabled').checked = true;
    
    const buzzerEnabledEl = document.getElementById('buzzerEnabled');
    if (buzzerEnabledEl) buzzerEnabledEl.checked = true;
    
    toggleAutoMode();
    
    showToast('Đã đặt lại về mặc định!', 'success');
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
