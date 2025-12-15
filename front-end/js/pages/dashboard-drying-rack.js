console.log("✅ Dashboard Giàn Phơi Thông Minh loaded at " + new Date().toLocaleString());

const token = localStorage.getItem('token');
const email = localStorage.getItem('email');
const API_BASE = 'http://localhost:8080/api';

let myChart = null;

// Lấy dữ liệu từ API
async function fetchData() {
    try {
        const res = await fetch(`${API_BASE}/in4-arduino/${email}/latest?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch data');
        
        const data = await res.json();
        console.log("📥 Data received:", data);
        
        if (data && data.length > 0) {
            updateCards(data[data.length - 1]); // Cập nhật card với dữ liệu mới nhất
            updateChart(data); // Cập nhật biểu đồ
            updateTable(data); // Cập nhật bảng lịch sử
        }
    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
}

// Cập nhật các card hiển thị
function updateCards(latest) {
    if (!latest) return;
    
    // Cập nhật cảm biến mưa
    const rainElement = document.getElementById('value-rain');
    if (rainElement) {
        rainElement.innerText = latest.rainSensor ? 'Có mưa' : 'Không mưa';
        rainElement.style.color = latest.rainSensor ? '#e74c3c' : '#27ae60';
    }
    
    // Cập nhật nhiệt độ
    const tempElement = document.getElementById('value-temp');
    if (tempElement) {
        tempElement.innerText = latest.temperature ? `${latest.temperature}°C` : '--';
    }
    
    // Cập nhật độ ẩm
    const humidityElement = document.getElementById('value-humidity');
    if (humidityElement) {
        humidityElement.innerText = latest.humidity ? `${latest.humidity}%` : '--';
    }
    
    // Cập nhật ánh sáng
    const lightElement = document.getElementById('value-light');
    if (lightElement) {
        lightElement.innerText = latest.light ? `${latest.light} lux` : '--';
    }
    
    // Cập nhật trạng thái giàn
    const rackElement = document.getElementById('value-rack');
    if (rackElement) {
        const statusText = {
            'open': 'Đã mở',
            'closed': 'Đã đóng',
            'opening': 'Đang mở...',
            'closing': 'Đang đóng...'
        };
        rackElement.innerText = statusText[latest.rackStatus] || latest.rackStatus;
        
        // Thay đổi màu sắc theo trạng thái
        if (latest.rackStatus === 'open') {
            rackElement.style.color = '#27ae60';
        } else if (latest.rackStatus === 'closed') {
            rackElement.style.color = '#3498db';
        } else {
            rackElement.style.color = '#f39c12';
        }
    }
}

// Cập nhật biểu đồ
function updateChart(data) {
    if (!data || data.length === 0) return;
    
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    // Lấy 20 bản ghi gần nhất
    const recentData = data.slice(-20).reverse();
    
    const labels = recentData.map((item, index) => {
        const date = new Date(item.createdAt);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    });
    
    const temperatures = recentData.map(item => item.temperature || 0);
    const humidities = recentData.map(item => item.humidity || 0);
    const lights = recentData.map(item => item.light || 0);
    
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Nhiệt độ (°C)',
                    data: temperatures,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Độ ẩm (%)',
                    data: humidities,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Ánh sáng (lux)',
                    data: lights,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Nhiệt độ / Độ ẩm'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Ánh sáng (lux)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Cập nhật bảng lịch sử
function updateTable(data) {
    const table = document.getElementById('history-table');
    if (!table) return;
    
    // Xóa các dòng cũ (trừ header)
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    
    // Lấy 10 bản ghi gần nhất
    const recentData = data.slice(-10).reverse();
    
    recentData.forEach((item, index) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = index + 1;
        
        const date = new Date(item.createdAt);
        row.insertCell(1).innerText = date.toLocaleString('vi-VN');
        
        row.insertCell(2).innerText = item.temperature ? `${item.temperature}°C` : '--';
        row.insertCell(3).innerText = item.humidity ? `${item.humidity}%` : '--';
        row.insertCell(4).innerText = item.light ? `${item.light} lux` : '--';
        row.insertCell(5).innerText = item.rainSensor ? 'Có mưa' : 'Không mưa';
        
        const statusText = {
            'open': 'Đã mở',
            'closed': 'Đã đóng',
            'opening': 'Đang mở...',
            'closing': 'Đang đóng...'
        };
        row.insertCell(6).innerText = statusText[item.rackStatus] || item.rackStatus;
    });
}

// Điều khiển giàn phơi
async function controlRack(action) {
    try {
        const res = await fetch(`${API_BASE}/mqtt/control`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                action: action,
                email: email
            })
        });
        
        if (!res.ok) throw new Error('Failed to control rack');
        
        console.log(`✅ Đã gửi lệnh: ${action}`);
        
        // Refresh data sau khi gửi lệnh
        setTimeout(fetchData, 1000);
    } catch (error) {
        console.error("❌ Error controlling rack:", error);
        alert("Không thể điều khiển giàn phơi. Vui lòng thử lại!");
    }
}

// Gắn sự kiện cho các nút điều khiển
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-button');
    const closeBtn = document.getElementById('close-button');
    const autoBtn = document.getElementById('auto-button');
    
    if (openBtn) {
        openBtn.addEventListener('click', () => controlRack('open'));
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => controlRack('close'));
    }
    
    if (autoBtn) {
        autoBtn.addEventListener('click', () => controlRack('auto'));
    }
    
    // Fetch dữ liệu lần đầu
    fetchData();
    
    // Auto-refresh mỗi 10 giây
    setInterval(fetchData, 10000);
});
