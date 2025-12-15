// Smart Rack Dashboard Page JS
const API_URL = 'http://localhost:8080/api';
let sensorChart, activityChart;

document.addEventListener('DOMContentLoaded', function() {
  document.body.style.display = 'block';
  initCharts();
  loadDashboardData();
  
  // Auto refresh every 30 seconds
  setInterval(loadDashboardData, 30000);
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
            tension: 0.4
          },
          {
            label: 'Độ ẩm (%)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Ánh sáng (lux)',
            data: [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
  
  // Activity chart
  const activityCtx = document.getElementById('activityChart');
  if (activityCtx) {
    activityChart = new Chart(activityCtx, {
      type: 'doughnut',
      data: {
        labels: ['Tự động', 'Thủ công', 'Cảnh báo'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: ['#10b981', '#6366f1', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
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
    // Get latest sensor data
    const response = await fetch(`${API_URL}/in4-arduino/${userEmail}/latest?limit=12`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Dashboard data:', data);
      
      if (data && data.length > 0) {
        const latest = data[0];
        updateStatusCards(latest);
        updateCharts(data);
      }
      updateLastUpdate();
    } else {
      console.error('Failed to fetch data:', response.status);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function updateStatusCards(data) {
  console.log('🔄 Updating cards with:', data);
  
  // Update rain card
  const rainCard = document.querySelector('[data-card="rain"]');
  if (rainCard) {
    const value = rainCard.querySelector('.status-value');
    const label = rainCard.querySelector('.status-label');
    const isRaining = data.rain || data.rainSensor || false;
    value.textContent = isRaining ? 'Có mưa' : 'Không mưa';
    label.textContent = isRaining ? 'Cảnh báo' : 'An toàn';
    rainCard.style.borderLeft = isRaining ? '4px solid #ef4444' : '4px solid #10b981';
  }
  
  // Update temperature card
  const tempCard = document.querySelector('[data-card="temperature"]');
  if (tempCard) {
    const value = tempCard.querySelector('.status-value');
    const label = tempCard.querySelector('.status-label');
    const temp = data.temperature || 0;
    const humidity = data.humidity || 0;
    value.textContent = `${temp}°C`;
    label.textContent = `Độ ẩm: ${humidity}%`;
  }
  
  // Update light card - use timestamp as placeholder for now
  const lightCard = document.querySelector('[data-card="light"]');
  if (lightCard) {
    const value = lightCard.querySelector('.status-value');
    const label = lightCard.querySelector('.status-label');
    const timestamp = new Date(data.timestamp || data.createdAt);
    const hour = timestamp.getHours();
    const lightLevel = hour >= 6 && hour <= 18 ? 850 : 100;
    value.textContent = `${lightLevel} lux`;
    label.textContent = lightLevel > 500 ? 'Sáng' : 'Tối';
  }
  
  // Update rack card - placeholder based on weather
  const rackCard = document.querySelector('[data-card="rack"]');
  if (rackCard) {
    const value = rackCard.querySelector('.status-value');
    const label = rackCard.querySelector('.status-label');
    const isRaining = data.rain || data.rainSensor || false;
    value.textContent = isRaining ? '0%' : '100%';
    label.textContent = isRaining ? 'Đã thu' : 'Đã mở';
    rackCard.style.borderLeft = isRaining ? '4px solid #6366f1' : '4px solid #10b981';
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
  if (!sensorChart || !dataArray || dataArray.length === 0) return;
  
  // Reverse to show oldest to newest
  const sortedData = [...dataArray].reverse();
  
  // Update sensor chart
  const labels = sortedData.map(d => {
    const date = new Date(d.timestamp || d.createdAt);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  });
  
  const temperatures = sortedData.map(d => d.temperature || 0);
  const humidities = sortedData.map(d => d.humidity || 0);
  const lights = sortedData.map(d => {
    const date = new Date(d.timestamp || d.createdAt);
    const hour = date.getHours();
    return hour >= 6 && hour <= 18 ? 850 : 100;
  });
  
  sensorChart.data.labels = labels;
  sensorChart.data.datasets[0].data = temperatures;
  sensorChart.data.datasets[1].data = humidities;
  sensorChart.data.datasets[2].data = lights;
  sensorChart.update();
}

function refreshData() {
  loadDashboardData();
  showToast('Đã làm mới dữ liệu!', 'success');
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

function quickAction(action) {
  if (action === 'retract') {
    if (confirm('Bạn có chắc muốn thu giàn khẩn cấp?')) {
      showToast('Đang thu giàn...', 'success');
    }
  }
}
