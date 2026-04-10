// UI Elements
const chatWindow = document.getElementById('chat-window');
const chatContent = document.getElementById('chat-content');
const userInput = document.getElementById('user-input');

// Toggle Chat Window
function toggleChat() {
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'flex';
    }
}

// Send Message
function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';

    // Simulate AI Response (In a real app, this would call an API like OpenAI)
    setTimeout(() => {
        handleAIResponse(text);
    }, 1000);
}

// Append Message to UI
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerHTML = text;
    chatContent.appendChild(msgDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

// AI Logic (Winner)
function handleAIResponse(input) {
    let response = "";
    const lowerInput = input.toLowerCase();

    // Language Detection / Default Response
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = "English: Hello, I’m Winner. How can I assist you today?<br>Pidgin: How I go take help you today?<br>Igbo: Kedu ka m ga-esi nyere gị aka?";
    } else if (lowerInput.includes('house') || lowerInput.includes('hostel') || lowerInput.includes('search')) {
        response = "I can help you find a house! What is your budget and preferred location?";
    } else if (lowerInput.includes('budget')) {
        response = "Great! We have several options in that range. Would you like to see properties in Lagos, Benin, or Awka?";
    } else if (lowerInput.includes('pidgin')) {
        response = "No wahala! I fit follow you talk pidgin. Wetin you dey find?";
    } else if (lowerInput.includes('igbo')) {
        response = "I ghotara. Kedu udi ulo i na-acho?";
    } else {
        response = "I'm Winner, your housing assistant. You can ask me about listings, budgets, or how to register as an agent.";
    }

    appendMessage('winner', response);
    speak(response.replace(/<br>/g, " "));
}

// Web Speech API - Text to Speech
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-NG'; // Nigerian English if available, or just en
        window.speechSynthesis.speak(utterance);
    }
}

// Web Speech API - Speech to Text
function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support voice recognition.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
    };
}

// Handle Enter Key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
