const chatbot = document.createElement('div')
chatbot.id = 'chatbot-container'

const chatbotjs = document.createElement('script')
chatbotjs.src = '../js/chatbot.js'

const chatbotcss = document.createElement('link')
chatbotcss.rel = 'stylesheet'
chatbotcss.href = '../css/components/chatbot.css'

chatbot.innerHTML = `
	<div id="chatbot-toggle">
		<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
		</svg>
	</div>
	<div id="chat-window">
		<div id="chatbot-header">
			<div class="header-content">
				<div class="header-left">
					<div class="bot-avatar">🤖</div>
					<div class="header-info">
						<h4>SmartDry Assistant</h4>
						<span class="status">🟢 Online</span>
					</div>
				</div>
				<button id="close-chat" class="close-btn">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		</div>
		<div id="messages"></div>
		<div id="input-area">
			<input type="text" id="input" placeholder="Nhắn tin cho SmartDry..." />
			<button id="send-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="22" y1="2" x2="11" y2="13"></line>
					<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
				</svg>
			</button>
		</div>
	</div>
`

document.body.appendChild(chatbot)
document.body.appendChild(chatbotjs)
document.head.appendChild(chatbotcss)