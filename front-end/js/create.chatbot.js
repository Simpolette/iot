const chatbot = document.createElement('div')
chatbot.id = 'chatbot-container'

const chatbotjs = document.createElement('script')
chatbotjs.src = '../js/chatbot.js'

const chatbotcss = document.createElement('link')
chatbotcss.rel = 'stylesheet'
chatbotcss.href = '../css/components/chatbot.css'

chatbot.innerHTML = `
	<div id="chat-content">
    	<div id="chatbot-header">ChatBot</div>
    	<div id="messages"></div>
    	<div id="input-area">
    		<input type="text" id="input" placeholder="Type /help for more information..." />
        	<button id="send-button">Send</button>
      	</div>
    </div>
	`

document.body.appendChild(chatbot)
document.body.appendChild(chatbotjs)
document.head.appendChild(chatbotcss)