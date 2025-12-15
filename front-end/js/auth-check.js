export function redirectIfNotLoggedIn() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    }
}

export function redirectIfLoggedIn() {
    if (localStorage.getItem("token")) {
        window.location.href = "dashboard.html";
    }
}

export function checkVerifyAccess() {
    if (localStorage.getItem("pendingVerification") !== "true") {
        window.location.href = "login.html";
    }
    else {
        document.body.style.display = 'flex'; // Hiển thị body nếu đang chờ xác minh
    }
}
