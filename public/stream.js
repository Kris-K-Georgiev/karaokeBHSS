const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const streamPlayer = document.getElementById('streamPlayer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const emojiButtons = document.querySelectorAll('.emoji-btn');

    // Synchronize video with server
    socket.on('videoUpdate', (data) => {
        streamPlayer.src = data.videoUrl;
        if (data.isPlaying) {
            streamPlayer.play();
        } else {
            streamPlayer.pause();
        }
    });

    // Handle chat updates
    socket.on('chatUpdate', (message) => {
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Handle emoji bubbles
    socket.on('emojiBubble', (emoji) => {
        createEmojiBubble(emoji);
    });

    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('chatMessage', message);
            chatInput.value = '';
        }
    });

    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            socket.emit('emojiBubble', emoji);
        });
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
