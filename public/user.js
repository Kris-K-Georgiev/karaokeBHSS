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
    
    let currentRating = 0;  // Променлива за съхранение на текущата оценка

    // Получаваме информация за видеото и го показваме
    socket.on('videoUpdateForUsers', (data) => {
        if (data.videoUrl) {
            videoPlayer.src = data.videoUrl;  // Задаваме новото видео URL
        }

        if (data.isPlaying) {
            videoPlayer.play();  // Стартираме видеото
        } else {
            videoPlayer.pause();  // Пауза, ако не трябва да се пуска
        }

        resetStars();  // Зануляваме оценката и звездите при пускане на ново видео
    });

    // Обновяване на съобщенията в чата
    socket.on('chatUpdate', (message) => {
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Изпращане на съобщение в чата
    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('chatMessage', message);
            chatInput.value = '';
        }
    });

    // Обработваме натискането на бутони за емоции
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            socket.emit('emojiBubble', emoji);
        });
    });

    // Показване на емоции в балони
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
                const isPlaying = videoPlayer.paused ? true : false;  // Проверяваме дали видеото е на пауза

                socket.emit('videoUpdateForUsers', { 
                    videoUrl: `https://www.youtube.com/embed/${videoId}`, 
                    isPlaying: isPlaying 
                });

                if (isPlaying) {
                    videoPlayer.play();  // Ако видеото е на пауза, го пускаме
                } else {
                    videoPlayer.pause();  // Ако видеото е пуснато, го спираме
                }

                videoUrlInput.value = ''; // Изчистваме полето
            }
        }
    });

    // Функция за извличане на YouTube видео ID от URL
    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([^\/\n\s&?]+))|youtu\.be\/([^\/\n\s&?]+))/;
        const match = url.match(regex);
        return match ? match[1] || match[2] : null;
    }

    // Оценяване със звезди
    starRatingContainer.forEach(container => {
        container.addEventListener('click', (event) => {
            if (event.target.classList.contains('star')) {
                const rating = parseInt(event.target.dataset.value);
                currentRating = rating;
                updateStars(rating);
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
        currentRating = 0;
        updateStars(currentRating);  // Reset на звездите при ново видео
    }
});

