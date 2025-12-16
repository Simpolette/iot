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

function toggleAutoMode() {
  const autoModeEnabled = document.getElementById('autoModeEnabled').checked;
  const autoModeSettings = document.getElementById('autoModeSettings');
  
  if (autoModeEnabled) {
    autoModeSettings.style.display = 'block';
  } else {
    autoModeSettings.style.display = 'none';
  }
}

async function loadSettings() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/setting`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const settings = await response.json();
      
      // Load sensor thresholds
      if (settings.autoCloseTemperature) {
        document.getElementById('tempThreshold').value = settings.autoCloseTemperature;
        updateValue('temp', settings.autoCloseTemperature);
      }
      if (settings.autoCloseHumidity) {
        document.getElementById('humidityThreshold').value = settings.autoCloseHumidity;
        updateValue('humidity', settings.autoCloseHumidity);
      }
      if (settings.minLightLevel) {
        document.getElementById('lightThreshold').value = settings.minLightLevel;
        updateValue('light', settings.minLightLevel);
      }
      
      // Load toggles
      if (settings.autoCloseOnRain !== undefined) {
        document.getElementById('rainEnabled').checked = settings.autoCloseOnRain;
      }
      if (settings.autoModeEnabled !== undefined) {
        document.getElementById('autoModeEnabled').checked = settings.autoModeEnabled;
        toggleAutoMode();
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveCustomizeSettings() {
  const token = localStorage.getItem('token');
  
  const settings = {
    autoModeEnabled: document.getElementById('autoModeEnabled').checked,
    autoCloseTemperature: parseInt(document.getElementById('tempThreshold').value),
    autoCloseHumidity: parseInt(document.getElementById('humidityThreshold').value),
    minLightLevel: parseInt(document.getElementById('lightThreshold').value),
    autoCloseOnRain: document.getElementById('rainEnabled').checked,
    tempEnabled: document.getElementById('tempEnabled').checked,
    nightRetract: document.getElementById('nightRetract').checked
  };
  
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/setting`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      showToast('Đã lưu cài đặt thành công!', 'success');
    } else {
      showToast('Lỗi khi lưu cài đặt!', 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Lỗi kết nối đến server!', 'error');
  } finally {
    showLoading(false);
  }
}

function resetToDefault() {
  if (confirm('Bạn có chắc muốn đặt lại về cài đặt mặc định?')) {
    document.getElementById('tempThreshold').value = 35;
    updateValue('temp', 35);
    document.getElementById('humidityThreshold').value = 80;
    updateValue('humidity', 80);
    document.getElementById('lightThreshold').value = 200;
    updateValue('light', 200);
    document.getElementById('autoModeEnabled').checked = true;
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
