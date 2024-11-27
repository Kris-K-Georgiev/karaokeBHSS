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
    const emojiContainer = document.getElementById('emojiContainer');
    let currentRating = 0;  // Variable for the current rating

    // Get video information and update the player
    socket.on('videoUpdateForUsers', (data) => {
        if (data.videoUrl) {
            videoPlayer.src = data.videoUrl;  // Set the new video URL
        }

        if (data.isPlaying) {
            videoPlayer.play();  // Play the video
        } else {
            videoPlayer.pause();  // Pause the video
        }

        resetStars();  // Reset the rating and stars when a new video is played
    });

    // Update chat messages
    socket.on('chatUpdate', (data) => {
        const { username, message } = data;  // Assuming data contains `username` and `message`
        const newMessage = document.createElement('div');
        newMessage.innerHTML = `<strong>${username}:</strong> ${message}`; // Use `username` and `message` properties
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;  // Keep scroll at the bottom
    });
    

    // Send a message in the chat
    sendMessageButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        const username = 'YourUsername';  // Replace with actual username
        socket.emit('chatMessage', { username, message });  // Send the object with username and message
        chatInput.value = '';  // Clear the input field
    }
});


    // Handle emoji button clicks
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.dataset.emoji;
            socket.emit('emojiBubble', emoji);  // Emit the emoji to the server
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
        emojiContainer.appendChild(bubble);
        bubble.style.left = `${Math.random() * 80 + 10}%`;  // Position the emoji randomly

        // Remove the emoji bubble after 3 seconds
        setTimeout(() => {
            bubble.remove();
        }, 3000);
    }

    // Play/Pause video when the button is clicked
    playPauseButton.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId) {
                const isPlaying = videoPlayer.paused ? true : false;  // Check if the video is paused

                socket.emit('videoUpdateForUsers', { 
                    videoUrl: `https://www.youtube.com/embed/${videoId}`, 
                    isPlaying: isPlaying 
                });

                if (isPlaying) {
                    videoPlayer.play();  // Play the video if it's paused
                } else {
                    videoPlayer.pause();  // Pause the video if it's playing
                }

                videoUrlInput.value = '';  // Clear the URL input field
            }
        }
    });

    // Extract YouTube video ID from the URL
    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+|(?:v|e(?:mbed)?)\/([^\/\n\s&?]+))|youtu\.be\/([^\/\n\s&?]+))/;
        const match = url.match(regex);
        return match ? match[1] || match[2] : null;
    }

    // Handle the emoji bubble's random positioning and animation
    function handleEmojiBubbles() {
        // Attach the emoji bubble on user actions (if applicable)
    }
});
