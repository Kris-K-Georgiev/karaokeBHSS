const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const videoUrlInput = document.getElementById('videoUrl');
    const playPauseButton = document.getElementById('playPauseButton');
    const starRatingContainer = document.querySelectorAll('.star-rating-container');
    let isVideoPlaying = false; // Да съхраняваме текущото състояние на видеото
    let starRating = 0;  // Да съхраняваме текущото състояние на видеото

    const adminFaceIcon = document.getElementById('adminFaceIcon'); // Лицето за администраторската страница

    // Обработваме обновлението на видеото
    socket.on('videoUpdateForUsers', (data) => {
        if (data.videoUrl) {
            videoPlayer.src = data.videoUrl;
        }

        if (data.isPlaying) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }

        resetStars();  // Reset на звездите, когато се пусне ново видео
    });

    // Обработваме натискането на звездите
    starRatingContainer.forEach(container => {
        container.addEventListener('click', (event) => {
            if (event.target.classList.contains('star')) {
                const rating = parseInt(event.target.dataset.value);
                starRating = rating;  // Записваме новото ниво на оценката
                updateStars(rating);  // Обновяваме звездите
                socket.emit('videoRating', rating);  // Изпращаме новата оценка на сървъра
            }
        });
    });

    function updateStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    function resetStars() {
        starRating = 0;  // Зануляваме рейтинга
        updateStars(starRating);  // Reset на звездите
    }

    // Изпращане на съобщение в чата
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

    // Изпращане на емоции
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            socket.emit('emojiBubble', emoji);
        });
    });

    // Показване на емоции
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

    // Обработваме натискането на бутона за пускане/спиране на видео
    playPauseButton.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) {
                isVideoPlaying = !isVideoPlaying;  // Променяме състоянието на видеото

                socket.emit('videoUpdateForUsers', { 
                    videoUrl: `https://www.youtube.com/embed/${videoId}`, 
                    isPlaying: isVideoPlaying 
                });

                if (isVideoPlaying) {
                    videoPlayer.play();
                } else {
                    videoPlayer.pause();
                }

                videoUrlInput.value = '';  // Изчистваме полето за видео URL
            }
        }
    });

    // Функция за извличане на YouTube видео ID от URL
    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([^\/\n\s&?]+))|youtu\.be\/([^\/\n\s&?]+))/;
        const match = url.match(regex);
        return match ? (match[1] || match[2]) : null;
    }
});
