// Wrap trong IIFE để tránh conflict với biến global
(function() {
	'use strict';
	
	const API_URL = 'http://localhost:8080/api';

	// Đợi DOM và chatbot widget được inject
	function initChatbot() {
	const messagesDiv = document.getElementById('messages');
	const input = document.getElementById('input');
	const sendButton = document.getElementById('send-button');
	const chatToggle = document.getElementById('chatbot-toggle');
	const chatWindow = document.getElementById('chat-window');
	const closeBtn = document.getElementById('close-chat');

	// Kiểm tra nếu các elements chưa tồn tại thì thử lại
	if (!chatToggle || !chatWindow || !messagesDiv || !input || !sendButton || !closeBtn) {
		console.log('⏳ Đang đợi chatbot widget được tạo...');
		setTimeout(initChatbot, 100);
		return;
	}

	console.log('✅ Chatbot đã được khởi tạo thành công');

	let isFirstOpen = true;

	// Toggle chat window
	chatToggle.addEventListener('click', () => {
		console.log('🖱️ Click vào chatbot toggle');
		chatWindow.classList.toggle('active');
		if (chatWindow.classList.contains('active')) {
			console.log('📖 Mở chat window');
			input.focus();
			// Show welcome message on first open
			if (isFirstOpen) {
				isFirstOpen = false;
				setTimeout(() => {
					appendMessage('Xin chào! 👋 Tôi là SmartDry Assistant. Tôi có thể giúp gì cho bạn về hệ thống giàn phơi thông minh?', 'bot');
				}, 300);
			}
		} else {
			console.log('📕 Đóng chat window');
		}
	});

	// Close chat window
	closeBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		console.log('❌ Click nút đóng');
		chatWindow.classList.remove('active');
	});

	function appendMessage(text, sender) {
		const div = document.createElement('div');
		div.className = `message ${sender}`;
		div.innerHTML = text;
		messagesDiv.appendChild(div);
		messagesDiv.scrollTop = messagesDiv.scrollHeight;
		return div;
	}

	function showTypingIndicator() {
		const typing = document.createElement('div');
		typing.className = 'message bot typing-indicator';
		typing.id = 'typing-indicator';
		typing.innerHTML = '<span></span><span></span><span></span>';
		messagesDiv.appendChild(typing);
		messagesDiv.scrollTop = messagesDiv.scrollHeight;
	}

	function removeTypingIndicator() {
		const typing = document.getElementById('typing-indicator');
		if (typing) typing.remove();
	}

	async function sendMessage() {
		const message = input.value.trim();
		if (!message) return;

		input.disabled = true;
		sendButton.disabled = true;

		appendMessage(message, 'user');
		input.value = '';

		// Show typing indicator
		showTypingIndicator();

		try {
			// Lấy userId từ localStorage (nếu đã đăng nhập)
			const user = JSON.parse(localStorage.getItem('user') || '{}');
			const userId = user._id || user.email || 'anonymous';

			const res = await fetch(`${API_URL}/chatbot`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					message,
					userId 
				})
			});

			removeTypingIndicator();

			if (!res.ok) {
				throw new Error(`Server error: ${res.status}`);
			}

			const data = await res.json();
			appendMessage(data.reply || 'Xin lỗi, tôi không có câu trả lời phù hợp.', 'bot');
		} catch (error) {
			removeTypingIndicator();
			console.error('Chatbot error:', error);
			
			let errorMsg = '❌ Xin lỗi, tôi đang gặp sự cố kết nối.';
			if (error.message.includes('Failed to fetch')) {
				errorMsg += ' Vui lòng kiểm tra xem server đã chạy chưa.';
			}
			appendMessage(errorMsg, 'bot');
		} finally {
			input.disabled = false;
			sendButton.disabled = false;
			input.focus();
		}
	}

	input.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' && !input.disabled) sendMessage();
	});

	sendButton.addEventListener('click', () => {
		if (!input.disabled) sendMessage();
	});
}

	// Khởi tạo khi DOM đã sẵn sàng
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initChatbot);
	} else {
		// DOM đã sẵn sàng, khởi tạo ngay
		initChatbot();
	}
})(); // End IIFE