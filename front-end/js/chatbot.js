const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendButton = document.getElementById('send-button');

function appendMessage(text, sender) {
	const div = document.createElement('div');
	div.className = `message ${sender}`;
	div.innerHTML = text;
	messagesDiv.appendChild(div);
	messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
	const message = input.value.trim();
	if (!message) return;

	input.disabled = true;
	sendButton.disabled = true;

	appendMessage(message, 'user');
	input.value = '';

	try {
		const res = await fetch('http://localhost:8080/api/chatbot', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message })
		});

		const data = await res.json();
		appendMessage(data.reply, 'bot');
	} catch (error) {
		appendMessage('Error talking to chatbot.', 'bot');
		console.error(error);
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