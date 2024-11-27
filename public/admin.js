const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const videoUrlInput = document.getElementById('videoUrl');
    const playPauseButton = document.getElementById('playPauseButton');
    const emojiContainer = document.getElementById('emojiContainer');
    let isVideoPlaying = false;

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
    });

    // Обработваме натискането на бутона за пускане/спиране на видео
    playPauseButton.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) {
                isVideoPlaying = !isVideoPlaying;

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

    // Изпращане на емоции
    socket.on('emojiBubble', (emoji) => {
        createEmojiBubble(emoji);
    });

    // Показване на емоции
    function createEmojiBubble(emoji) {
        const bubble = document.createElement('div');
        bubble.classList.add('emoji-bubble');
        bubble.textContent = emoji;
        emojiContainer.appendChild(bubble);
        bubble.style.left = `${Math.random() * 80 + 10}%`;

        setTimeout(() => {
            bubble.remove();
        }, 3000);
    }
});
