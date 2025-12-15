// header
fetch('../components/header.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;

        // GẮN LOGIC LOGOUT Ở ĐÂY
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("token"); // Xoá token
                localStorage.removeItem("verifyEmail"); // Xoá thông tin người dùng
                localStorage.removeItem("email"); // Xoá email
                window.location.href = "../pages/index.html"; // Chuyển về trang chính
            });
        }
        const token = localStorage.getItem('token');
        const currentPage = location.pathname;
        const protectedPages = ['dashboard.html', 'setting.html', 'profile.html'];

        if (!token && protectedPages.some(p => currentPage.includes(p))) {
            alert('Vui lòng đăng nhập để tiếp tục.');
            window.location.href = '../pages/login.html';
        } else {
            document.body.style.display = 'flex'; // Hiển thị body nếu đã đăng nhập
        }
    });

// dropdown
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    var container = document.querySelector(".profile-container");
    dropdown.classList.toggle("show");
    container.classList.toggle("open");
}

document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("dropdown");
    if (!event.target.closest(".profile-container")) {
        dropdown.style.display = "none";
    }
});
