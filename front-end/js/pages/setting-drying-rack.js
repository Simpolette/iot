const token = localStorage.getItem("token");
const email = localStorage.getItem("email");
const API_BASE = 'http://localhost:8080/api';

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    document.querySelector(".save-btn").addEventListener("click", async () => {
        const settings = {
            autoCloseTemperature: parseInt(document.getElementById("autoCloseTemperature").value),
            autoCloseHumidity: parseInt(document.getElementById("autoCloseHumidity").value),
            minLightLevel: parseInt(document.getElementById("minLightLevel").value),
            autoCloseOnRain: document.getElementById("autoCloseOnRain").checked,
            enableNotifications: document.getElementById("enableNotifications").checked,
            email: email,
            wifiSSID: document.getElementById("wifiSSID").value || '',
            wifiPassword: document.getElementById("wifiPassword").value || ''
        };

        try {
            const res = await fetch(`${API_BASE}/settings/${email}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert("✅ Cài đặt đã được lưu thành công!");
                
                // Gửi cấu hình đến ESP32 qua MQTT
                const payloadToEsp32 = {
                    autoCloseTemp: settings.autoCloseTemperature,
                    autoCloseHumid: settings.autoCloseHumidity,
                    minLight: settings.minLightLevel,
                    autoRain: settings.autoCloseOnRain,
                    ...(settings.wifiSSID ? { ssid: settings.wifiSSID } : {}),
                    ...(settings.wifiPassword ? { pass: settings.wifiPassword } : {}),
                };

                const mqttRes = await sendToEsp32(payloadToEsp32, token);
                if (mqttRes.ok) {
                    console.log("✅ Đã gửi cấu hình đến ESP32");
                }
            } else {
                alert("❌ Lưu cài đặt thất bại!");
            }
        } catch (err) {
            alert("❌ Có lỗi khi gửi dữ liệu: " + err.message);
        }
    });
});

async function sendToEsp32(payload, token) {
    try {
        const res = await fetch(`${API_BASE}/mqtt/config`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        console.log("📤 Gửi cấu hình đến ESP32:", data);
        return { ok: res.ok, data };
    } catch (e) {
        return { ok: false, error: e?.message || String(e) };
    }
}

async function loadSettings() {
    try {
        const res = await fetch(`${API_BASE}/settings/${email}/get?limit=1`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Không thể lấy dữ liệu cài đặt");

        const data = await res.json();
        const settings = data[0] || {};
        
        // Gán dữ liệu vào các input
        document.getElementById("autoCloseTemperature").value = settings.autoCloseTemperature || 30;
        document.getElementById("autoCloseHumidity").value = settings.autoCloseHumidity || 80;
        document.getElementById("minLightLevel").value = settings.minLightLevel || 200;
        document.getElementById("autoCloseOnRain").checked = settings.autoCloseOnRain !== false;
        document.getElementById("enableNotifications").checked = settings.enableNotifications !== false;
        document.getElementById("wifiSSID").value = settings.wifiSSID || '';
        document.getElementById("wifiPassword").value = settings.wifiPassword || '';
        
        console.log("📥 Đã tải cài đặt:", settings);
    } catch (err) {
        console.error("❌ Lỗi khi tải cài đặt:", err.message);
    }
}
