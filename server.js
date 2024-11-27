const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Конфигурация на сесията
const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // Задай secure: true, ако използваш HTTPS
});

app.use(sessionMiddleware); // Интеграция с Express
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Папка за статични файлове

// Интеграция на сесията със Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Потребители и текущо видео
let users = [];
let currentVideo = { videoUrl: '', isPlaying: false };

// Роут за логин
app.post('/login', (req, res) => {
    const { username } = req.body;

    // Проверка дали името вече съществува
    if (users.find((user) => user.username === username)) {
        return res.json({ success: false, message: 'Името вече съществува.' });
    }

    let role = 'user'; // Дефолтна роля
    if (username === 'krischoto') role = 'admin';
    if (username === 'stream') role = 'stream';

    users.push({ username, role });
    req.session.username = username;
    req.session.role = role;

    res.json({
        success: true,
        redirectURL: role === 'admin' ? '/admin' : role === 'stream' ? '/stream' : '/user',
    });
});

// Роутове за роли
app.get('/user', (req, res) => {
    if (!req.session.username) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/admin', (req, res) => {
    if (req.session.role !== 'admin') return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/stream', (req, res) => {
    if (req.session.role !== 'stream') return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'stream.html'));
});

// Логаут
app.get('/logout', (req, res) => {
    const username = req.session.username;
    req.session.destroy((err) => {
        if (err) return res.redirect('/');
        res.clearCookie('connect.sid');

        // Премахване на потребителя след излизане
        users = users.filter((user) => user.username !== username);
        res.redirect('/');
    });
});

// Socket.IO събития
// Socket.IO събития
io.on('connection', (socket) => {
    const session = socket.request.session;

    if (!session || !session.username) {
        console.log('Потребител без сесия се опита да се свърже.');
        return;
    }

    // Изпращане на текущото видео
    socket.emit('videoUpdateForUsers', currentVideo);

    // Чат съобщения
    socket.on('chatMessage', (message) => {
        const username = session.username || 'Анонимен';
        io.emit('chatUpdate', { username, message });
    });

    // Получаване на ново видео
    socket.on('videoUpdateForUsers', (data) => {
        if (data.videoUrl) {
            currentVideo = { videoUrl: data.videoUrl, isPlaying: data.isPlaying };
            io.emit('videoUpdateForUsers', currentVideo);
        }
    });

    // Получаване на оценка на видео
    socket.on('videoRating', (rating) => {
        console.log(`Оценка за видео от ${session.username}: ${rating} звезди`);
        // Можете да обработите оценката тук (например да я запишете в база данни)
    });

    // Изпращане на емоции
    socket.on('emojiBubble', (emoji) => {
        io.emit('emojiBubble', emoji);
    });

    // Излизане
    socket.on('disconnect', () => {
        console.log(`Потребителят ${session.username} се изключи.`);
    });
});


// Стартиране на сървъра
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});