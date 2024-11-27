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
    
  

    function resetStars() {
        currentRating = 0;
        updateStars(currentRating);  // Reset на звездите
    }
    // Изпращане на съобщение
    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('chatMessage', message);
            chatInput.value = '';
        }
    });
    

    playPauseButton.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) {
                const isPlaying = videoPlayer.paused ? true : false;
                socket.emit('videoUpdateForUsers', { 
                    videoUrl: `https://www.youtube.com/embed/${videoId}`, 
                    isPlaying: isPlaying 
                });

                if (isPlaying) {
                    videoPlayer.play();
                } else {
                    videoPlayer.pause();
                }

                videoUrlInput.value = '';
            }
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
    playButton.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) {
                // Изпращаме състоянието на видеото заедно с новото URL
                socket.emit('videoUpdateForUsers', { 
                    videoUrl: `https://www.youtube.com/embed/${videoId}`, 
                    isPlaying: !isVideoPlaying 
                });

                // Променяме състоянието на видеото (пуснато/спряно)
                isVideoPlaying = !isVideoPlaying;

                if (isVideoPlaying) {
                    videoPlayer.play();
                } else {
                    videoPlayer.pause();
                }

                videoUrlInput.value = ''; // Изчистваме полето
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
