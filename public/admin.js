const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const videoUrlInput = document.getElementById('videoUrl');
    const playPauseButton = document.getElementById('playPauseButton');

    // Проверка на сесията дали е администратор
    window.onload = function() {
        fetch('/check-session', {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && (data.role === 'admin' || data.role === 'stream')) {
                console.log('Добре дошли, администратор или стриймър!');
            } else {
                window.location.href = '/'; // Ако не е администратор, пренасочете го
            }
        })
        .catch(err => {
            console.log('Грешка при проверка на сесията:', err);
        });
    };

    // Play/pause functionality
    playPauseButton.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            videoPlayer.src = `https://www.youtube.com/embed/${getYouTubeVideoId(videoUrl)}`;
            videoUrlInput.value = '';  // Изчистваме полето
        }
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

    // Функция за извличане на YouTube видео ID от URL
    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([^\/\n\s&?]+))|youtu\.be\/([^\/\n\s&?]+))/;
        const match = url.match(regex);
        return match ? match[1] || match[2] : null;
    }
});
