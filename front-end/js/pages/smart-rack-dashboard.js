// Smart Rack Dashboard Page JS
const API_URL = 'http://localhost:8080/api';
let sensorChart;

document.addEventListener('DOMContentLoaded', function() {
  document.body.style.display = 'block';
  initCharts();
  loadDashboardData();
  
  // Initialize buzzer toggle event
  initBuzzerControl();
  
  // Auto refresh - tần suất tùy theo time range
  startAutoRefresh();
});

function initCharts() {
  // Sensor chart
  const sensorCtx = document.getElementById('sensorChart');
  if (sensorCtx) {
    sensorChart = new Chart(sensorCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Nhiệt độ (°C)',
            data: [],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Độ ẩm (%)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Mức độ sáng (%)',
            data: [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
              maxTicksLimit: 20
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Nhiệt độ (°C) / Độ ẩm (%)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Mức độ sáng (%)'
            },
            grid: {
              drawOnChartArea: false,
            }
          }
        }
      }
    });
  }
}

async function loadDashboardData() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    console.error('User not found in localStorage');
    return;
  }
  
  const user = JSON.parse(userStr);
  const userEmail = user.email;
  
  try {
    // Lấy khoảng thời gian từ dropdown (mặc định 12h)
    const timeRange = document.getElementById('chartTimeRange')?.value || '12h';
    const limit = getDataLimitFromRange(timeRange);
    
    console.log(`📊 Fetching data for email: ${userEmail}, limit: ${limit}`);
    
    // Get sensor data from MongoDB
    const response = await fetch(`${API_URL}/in4-arduino/${userEmail}/latest?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Loaded ${data.length} records from MongoDB:`, data);
      
      if (data && data.length > 0) {
        const latest = data[0];
        updateStatusCards(latest);
        updateCharts(data);
      } else {
        console.warn(`⚠️ No data available for email: ${userEmail}`);
        console.warn('💡 Tip: Kiểm tra email trong database hoặc chạy ESP32 để tạo dữ liệu mới');
        showToast(`⚠️ Chưa có dữ liệu cho email ${userEmail}`, 'warning');
      }
      updateLastUpdate();
    } else {
      console.error('Failed to fetch data:', response.status);
      showToast('❌ Lỗi khi tải dữ liệu', 'error');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('❌ Lỗi kết nối server', 'error');
  }
}

// Chuyển đổi time range sang số lượng records
function getDataLimitFromRange(range) {
  const limits = {
    '1h': 360,     // 1 giờ: 360 records (10s/record)
    '6h': 2160,    // 6 giờ: 2160 records
    '12h': 4320,   // 12 giờ: 4320 records
    '24h': 8640,   // 24 giờ: 8640 records
    '7d': 60480    // 7 ngày: 60480 records
  };
  return limits[range] || 4320;
}

// Hàm refresh data (gọi từ button)
function refreshData() {
  console.log('🔄 Manual refresh triggered');
  showToast('🔄 Đang tải dữ liệu...', 'success');
  loadDashboardData();
}

// Format thời gian theo scale
function formatTimeLabel(date, range) {
  const options = {
    '1h': { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    '6h': { hour: '2-digit', minute: '2-digit' },
    '12h': { hour: '2-digit', minute: '2-digit' },
    '24h': { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' },
    '7d': { day: '2-digit', month: '2-digit', hour: '2-digit' }
  };
  
  return date.toLocaleString('vi-VN', options[range] || options['12h']);
}

function updateStatusCards(data) {
  console.log('🔄 Updating cards with:', data);
  
  // Update rain card
  const rainCard = document.querySelector('[data-card="rain"]');
  if (rainCard) {
    const value = rainCard.querySelector('.status-value');
    // const isRaining = data.rain || data.rainSensor || false;
    const isRaining = data.rainSensor || false;
    value.textContent = isRaining ? 'Có mưa' : 'Không mưa';
    rainCard.style.borderLeft = isRaining ? '4px solid #ef4444' : '4px solid #10b981';
    
    // Ẩn/hiện nút buzzer dựa trên trạng thái mưa và cảm biến mưa có bật hay không
    updateBuzzerControlVisibility(isRaining, data.rainEnabled);
  }
  
  // Update temperature card
  const tempCard = document.querySelector('[data-card="temperature"]');
  if (tempCard) {
    const value = tempCard.querySelector('.status-value');
    const temp = data.temperature || 0;
    value.textContent = `${temp}°C`;
  }

  const humidCard = document.querySelector('[data-card="humidity"]');
  if (humidCard) {
    const value = humidCard.querySelector('.status-value');
    const humidity = data.humidity || 0;
    value.textContent = `Độ ẩm: ${humidity}%`;
  }
  
  // Update light card - use timestamp as placeholder for now
  const lightCard = document.querySelector('[data-card="light"]');
  if (lightCard) {
    const value = lightCard.querySelector('.status-value');
    const lightLevel = data.light || 0;
    value.textContent = `${lightLevel} %`;
  }
  
  // Update rack card - placeholder based on weather
  const rackCard = document.querySelector('[data-card="rack"]');
  if (rackCard) {
    const value = rackCard.querySelector('.status-value');
    const rackStatus = data.rackStatus;

    // Chỉ hiển thị Mở hoặc Đóng
    console.log(rackStatus);
    value.textContent = rackStatus == "close" ? 'Đóng' : 'Mở';
    
    // Màu sắc: Xanh lá (mở), Xanh dương (đóng)
    rackCard.style.borderLeft = rackStatus == "close" ? '4px solid #6366f1' : '4px solid #10b981';
  }

  const predictCard = document.querySelector('[data-card="predict"]');
  if (predictCard) {
    const value = predictCard.querySelector('.status-value');
    const predict = data.predict;
    console.log(predict);
    
    value.textContent = predict ? 'Có mưa' : 'Không mưa';
    
    predictCard.style.borderLeft = predict == 1 ? '4px solid #6366f1' : '4px solid #10b981';
  }
}

function updateLastUpdate() {
  const lastUpdate = document.getElementById('lastUpdate');
  if (lastUpdate) {
    const now = new Date();
    lastUpdate.textContent = now.toLocaleTimeString('vi-VN');
  }
}

function updateCharts(dataArray) {
  if (!sensorChart || !dataArray || dataArray.length === 0) {
    console.warn('⚠️ Chart or data not available');
    return;
  }
  
  // Reverse to show oldest to newest (left to right)
  const sortedData = [...dataArray].reverse();
  
  console.log(`📈 Updating chart with ${sortedData.length} data points`);
  
  // Lấy time range hiện tại
  const timeRange = document.getElementById('chartTimeRange')?.value || '12h';
  
  // Tạo labels (thời gian) với format động
  const labels = sortedData.map(d => {
    const date = new Date(d.timestamp || d.createdAt);
    return formatTimeLabel(date, timeRange);
  });
  
  // Lấy dữ liệu thực từ MongoDB
  const temperatures = sortedData.map(d => parseFloat(d.temperature) || 0);
  const humidities = sortedData.map(d => parseFloat(d.humidity) || 0);
  const lights = sortedData.map(d => parseFloat(d.lightLevel || d.light || 0));
  
  // Log để debug
  console.log('📊 Chart data:', {
    timeRange,
    dataPoints: labels.length,
    firstTime: labels[0],
    lastTime: labels[labels.length - 1],
    temperatures: temperatures.slice(-3),
    humidities: humidities.slice(-3),
    lights: lights.slice(-3)
  });
  
  // Cập nhật chart
  sensorChart.data.labels = labels;
  sensorChart.data.datasets[0].data = temperatures;
  sensorChart.data.datasets[1].data = humidities;
  sensorChart.data.datasets[2].data = lights;
  sensorChart.update('none'); // 'none' để update nhanh hơn
  
  console.log('✅ Chart updated successfully');
}

// Auto refresh với tần suất động
let refreshInterval;

function startAutoRefresh() {
  // Clear interval cũ nếu có
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  const timeRange = document.getElementById('chartTimeRange')?.value || '12h';
  
  // Tần suất refresh tùy theo time range
  const refreshRates = {
    '1h': 10000,   // 10 giây (real-time)
    '6h': 30000,   // 30 giây
    '12h': 60000,  // 1 phút
    '24h': 120000, // 2 phút
    '7d': 300000   // 5 phút
  };
  
  const interval = refreshRates[timeRange] || 60000;
  
  console.log(`🔄 Auto-refresh mỗi ${interval/1000}s cho time range: ${timeRange}`);
  
  refreshInterval = setInterval(() => {
    loadDashboardData();
  }, interval);
}

// Update chart khi thay đổi time range
function updateChartRange() {
  const select = document.getElementById('chartTimeRange');
  const range = select?.value || '12h';
  
  const rangeText = {
    '1h': '1 giờ qua',
    '6h': '6 giờ qua',
    '12h': '12 giờ qua',
    '24h': '24 giờ qua',
    '7d': '7 ngày qua'
  };
  
  showToast(`📊 Đang tải dữ liệu ${rangeText[range]}...`, 'success');
  loadDashboardData();
  
  // Restart auto-refresh với tần suất mới
  startAutoRefresh();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Mode toggle
const modeToggle = document.getElementById('modeToggle');
if (modeToggle) {
  modeToggle.addEventListener('change', function() {
    const manualControls = document.getElementById('manualControls');
    const autoStatus = document.getElementById('autoStatus');
    
    if (this.checked) {
      manualControls.style.display = 'none';
      autoStatus.style.display = 'block';
    } else {
      manualControls.style.display = 'block';
      autoStatus.style.display = 'none';
    }
  });
}

// Quick Mode Toggle
const quickModeToggle = document.getElementById('quickModeToggle');
const quickOpenBtn = document.getElementById('quickOpenBtn');
const quickCloseBtn = document.getElementById('quickCloseBtn');
const autoModeNote = document.getElementById('autoModeNote');
const quickModeText = document.getElementById('quickModeText');

if (quickModeToggle) {
  quickModeToggle.addEventListener('change', function() {
    const isAuto = this.checked;
    
    // Cập nhật UI
    if (isAuto) {
      quickModeText.textContent = 'Chế độ tự động';
      quickOpenBtn.disabled = true;
      quickCloseBtn.disabled = true;
      autoModeNote.classList.remove('hidden');
      showToast('✅ Đã bật chế độ tự động', 'success');
    } else {
      quickModeText.textContent = 'Chế độ thủ công';
      quickOpenBtn.disabled = false;
      quickCloseBtn.disabled = false;
      autoModeNote.classList.add('hidden');
      showToast('🎮 Đã chuyển sang chế độ thủ công', 'success');
    }
    
    // Đồng bộ với toggle chính
    if (modeToggle) {
      modeToggle.checked = isAuto;
      modeToggle.dispatchEvent(new Event('change'));
    }
    
    // Gửi lệnh đến server (tùy chọn)
    updateMode(isAuto);
  });
}

// Quick Open Button
if (quickOpenBtn) {
  quickOpenBtn.addEventListener('click', async function() {
    if (this.disabled) return;
    
    if (confirm('🔼 Xác nhận MO giàn phơi?')) {
      this.disabled = true;
      showToast('⏫ Đang mở giàn phơi...', 'success');
      
      try {
        await controlRack('open');
        showToast('✅ Đã mở giàn phơi thành công!', 'success');
      } catch (error) {
        showToast('❌ Lỗi khi mở giàn phơi', 'error');
      } finally {
        this.disabled = quickModeToggle.checked; // Chỉ enable nếu đang ở chế độ thủ công
      }
    }
  });
}

// Quick Close Button
if (quickCloseBtn) {
  quickCloseBtn.addEventListener('click', async function() {
    if (this.disabled) return;
    
    if (confirm('🔽 Xác nhận ĐÓNG giàn phơi?')) {
      this.disabled = true;
      showToast('⏬ Đang đóng giàn phơi...', 'success');
      
      try {
        await controlRack('close');
        showToast('✅ Đã đóng giàn phơi thành công!', 'success');
      } catch (error) {
        showToast('❌ Lỗi khi đóng giàn phơi', 'error');
      } finally {
        this.disabled = quickModeToggle.checked;
      }
    }
  });
}

// Emergency Stop Button
const emergencyStopBtn = document.getElementById('emergencyStopBtn');
if (emergencyStopBtn) {
  emergencyStopBtn.addEventListener('click', async function() {
    if (confirm('⚠️ THU KHẨN CẤP - Bạn có chắc chắn?')) {
      showToast('🚨 Đang thu giàn khẩn cấp...', 'success');
      
      try {
        await controlRack('close');
        showToast('✅ Đã thu giàn khẩn cấp!', 'success');
        
        // Tự động chuyển về chế độ thủ công
        if (quickModeToggle && quickModeToggle.checked) {
          quickModeToggle.checked = false;
          quickModeToggle.dispatchEvent(new Event('change'));
        }
      } catch (error) {
        showToast('❌ Lỗi khi thu khẩn cấp', 'error');
      }
    }
  });
}

// Refresh Button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', function() {
    showToast('🔄 Đang làm mới dữ liệu...', 'success');
    loadDashboardData();
  });
}

// Hàm cập nhật chế độ tự động/thủ công
async function updateMode(isAuto) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  try {
    const response = await fetch(`${API_URL}/in4-arduino/${user.email}/mode`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        mode: isAuto ? 'auto' : 'manual' 
      })
    });
    
    if (!response.ok) {
      console.error('Failed to update mode');
    }
  } catch (error) {
    console.error('Error updating mode:', error);
  }
}

// Hàm điều khiển giàn phơi - Gửi lệnh qua MQTT
async function controlRack(action) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  try {
    // Gửi lệnh MQTT qua API
    const response = await fetch(`${API_URL}/mqtt/control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        action: action.toLowerCase() // 'open' hoặc 'close'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to control rack');
    }
    
    const data = await response.json();
    console.log('✅ MQTT Control response:', data);
    
    // Refresh data sau khi điều khiển
    setTimeout(loadDashboardData, 1500);
    
    return data;
  } catch (error) {
    console.error('❌ Error controlling rack:', error);
    throw error;
  }
}

function quickAction(action) {
  if (action === 'retract') {
    if (confirm('Bạn có chắc muốn thu giàn khẩn cấp?')) {
      showToast('Đang thu giàn...', 'success');
    }
  }
}

// Hàm kiểm soát hiển thị nút buzzer
function updateBuzzerControlVisibility(isRaining, rainSensorEnabled) {
  const buzzerControlSection = document.getElementById('buzzerControlSection');
  
  if (buzzerControlSection) {
    // Load buzzerEnabled setting from localStorage or fetch from API
    loadBuzzerSetting().then(buzzerEnabled => {
      // Hiện nút buzzer khi:
      // 1. Cảm biến mưa đang BẬT
      // 2. Tính năng buzzer được BẬT trong settings
      if (rainSensorEnabled !== false && buzzerEnabled !== false) {
        buzzerControlSection.style.display = 'block';
      } else {
        buzzerControlSection.style.display = 'none';
      }
    });
  }
}

// Hàm load cài đặt buzzer từ API
async function loadBuzzerSetting() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/setting`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const settings = await response.json();
      return settings.buzzerEnabled !== undefined ? settings.buzzerEnabled : true;
    }
  } catch (error) {
    console.error('Error loading buzzer setting:', error);
  }
  
  return true; // Mặc định bật
}

// Hàm điều khiển buzzer
async function controlBuzzer(enabled) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  try {
    const response = await fetch(`${API_URL}/in4-arduino/${user.email}/buzzer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        enabled: enabled
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to control buzzer');
    }
    
    const data = await response.json();
    console.log('Buzzer control response:', data);
    
    showToast(enabled ? '✅ Đã bật loa cảnh báo' : '❌ Đã tắt loa cảnh báo', 'success');
    
    return data;
  } catch (error) {
    console.error('Error controlling buzzer:', error);
    showToast('❌ Lỗi khi điều khiển loa', 'error');
    throw error;
  }
}

// Khởi tạo sự kiện cho buzzer toggle
function initBuzzerControl() {
  const buzzerToggle = document.getElementById('buzzerToggle');
  if (buzzerToggle) {
    buzzerToggle.addEventListener('change', async function() {
      const enabled = this.checked;
      try {
        await controlBuzzer(enabled);
      } catch (error) {
        // Rollback nếu lỗi
        this.checked = !enabled;
      }
    });
  }
}
