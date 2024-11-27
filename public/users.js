const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const videoUrlInput = document.getElementById('videoUrl');
    const playPauseButton = document.getElementById('playPauseButton');
    const emojiContainer = document.getElementById('emojiContainer');
    let isVideoPlaying = false;

    // Чат логика
    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('chatMessage', message);
            chatInput.value = '';
        }
    });

    // Обработка на съобщения в чата
    socket.on('chatUpdate', (data) => {
        const { username, message } = data;
        const newMessage = document.createElement('div');
        newMessage.innerHTML = `<strong>${username}:</strong> ${message}`;
        chatMessages.appendChild(newMessage);
    });


    // Емоджи логика
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            socket.emit('emojiBubble', emoji);
        });
    });

    socket.on('emojiBubble', (emoji) => {
        createEmojiBubble(emoji);
    });

    function createEmojiBubble(emoji) {
        const bubble = document.createElement('div');
        bubble.classList.add('emoji-bubble');
        bubble.textContent = emoji;
        emojiContainer?.appendChild(bubble);
        bubble.style.left = `${Math.random() * 80 + 10}%`;  // Позициониране на емоджито на случаен принцип

        // Премахване на емоджито след 3 секунди
        setTimeout(() => {
            bubble.remove();
        }, 3000);
    }

    // Видео логика
    if (videoPlayer) {
        socket.on('videoUpdateForUsers', (data) => {
            const { videoUrl, isPlaying } = data;

            if (videoUrl) {
                videoPlayer.src = videoUrl;
            }

            if (isPlaying) {
                videoPlayer.play();
            } else {
                videoPlayer.pause();
            }
        });

        playPauseButton?.addEventListener('click', () => {
            const videoUrl = videoUrlInput.value.trim();
            if (videoUrl) {
                const videoId = getYouTubeVideoId(videoUrl);
                if (videoId) {
                    isVideoPlaying = !isVideoPlaying;

                    socket.emit('videoUpdateForUsers', { 
                        videoUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`, // Добавено autoplay
                        isPlaying: isVideoPlaying 
                    });

                    if (isVideoPlaying) {
                        videoPlayer.play();
                    } else {
                        videoPlayer.pause();
                    }

                    videoUrlInput.value = '';  // Изчистване на полето за видео URL
                } else {
                    console.error('Invalid YouTube URL');
                }
            } else {
                console.error('YouTube URL is empty');
            }
        });
    }

    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([^\/\n\s&?]+))|youtu\.be\/([^\/\n\s?]+))/;
        const match = url.match(regex);
        return match ? match[1] || match[2] : null;
    }
});
