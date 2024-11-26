const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const emojiButtons = document.querySelectorAll('.emoji-btn');

    // Слушаме за актуализация на видеото от сървъра
    socket.on('videoUpdateForAdmin', (data) => {
        if (data.videoUrl) {
            videoPlayer.src = data.videoUrl;  // Задаваме новото видео URL в iframe
        }

        if (data.isPlaying) {
            videoPlayer.play();  // Стартираме видеото, ако трябва да се пуска
        } else {
            videoPlayer.pause();  // Пауза, ако не трябва да се пуска
        }
    });

    socket.on('chatUpdate', (message) => {
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Handle sending chat messages
    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('chatMessage', message);
            chatInput.value = '';
        }
    });

    // Handle emoji button clicks
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            socket.emit('emojiBubble', emoji);
        });
    });

    // Display emoji bubbles
    socket.on('emojiBubble', (emoji) => {
        createEmojiBubble(emoji);
    });

    function createEmojiBubble(emoji) {
        const bubble = document.createElement('div');
        bubble.classList.add('emoji-bubble');
        bubble.textContent = emoji;
        document.getElementById('videoContainer').appendChild(bubble);
        bubble.style.left = `${Math.random() * 80 + 10}%`;

        setTimeout(() => {
            bubble.remove();
        }, 3000);
    }
});
