const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Моделиране на данни
let users = [];
let currentVideo = { videoUrl: '', isPlaying: false };  // Структура с видео URL и състояние на възпроизвеждане
let songs = ['Песен 1', 'Песен 2', 'Песен 3'];

const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
});

app.use(sessionMiddleware); // Добавяне на сесия middleware

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Папка за статични файлове

// Роут за логин
app.post('/login', (req, res) => {
    const { username } = req.body;

    // Проверка за уникалност на името
    if (username !== 'krischoto' && users.find(user => user.username === username)) {
        return res.json({ success: false, message: 'Името вече съществува.' });
    }

    if (username === 'krischoto') {
        users.push({ username, role: 'admin' });
        req.session.username = username;
        req.session.role = 'admin';
        return res.json({ success: true, redirectURL: '/admin' });
    }

    if (username === 'stream') {
        users.push({ username, role: 'stream' });
        req.session.username = username;
        req.session.role = 'stream';
        return res.json({ success: true, redirectURL: '/stream' });
    }

    // Обикновен потребител
    users.push({ username, role: 'user' });
    req.session.username = username;
    req.session.role = 'user';
    res.json({ success: true, redirectURL: '/user' });
});

// Роутове за различни роли
app.get('/user', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/admin', (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'stream') {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/stream', (req, res) => {
    if (req.session.role !== 'stream') {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'stream.html'));
});

// Логаут
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Прехващане на сесията в Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
    // Проверка дали сесията съществува
    if (!socket.request.session) {
        console.log('Няма сесия за този клиент!');
        return;
    }

    console.log(socket.request.session);  // Проверка на сесията на Socket.io

    // Изпращаме текущото видео на новия клиент
    socket.emit('videoUpdateForAdmin', currentVideo);

    // Слушаме за чат съобщения
    socket.on('chatMessage', (data) => {
        io.emit('chatUpdate', data);
    });

    // Синхронизация на видео (само за администратор или стриймър)
// Синхронизация на видео (само за администратор или стриймър)
socket.on('setVideoForAdmin', (data) => {
    if (socket.request.session && socket.request.session.role && 
        (socket.request.session.role === 'admin' || socket.request.session.role === 'stream')) {
        currentVideo.videoUrl = data.videoUrl;  // Задаваме URL на видеото
        currentVideo.isPlaying = data.isPlaying;  // Състояние на видеото (пуснато или паузирано)
        io.emit('videoUpdateForAdmin', currentVideo);  // Изпраща новото видео на всички свързани потребители
    } else {
        console.log('Нямате права да променяте видео!');
    }
});


    // Добавяне на нова песен (по избор)
    socket.on('addSong', (song) => {
        if (song && !songs.includes(song)) {
            songs.push(song);
            io.emit('loadSongs', songs);  // Изпращаме актуализиран списък с песни на всички клиенти
        }
    });

    // Синхронизация на емотикони
    socket.on('emojiBubble', (emoji) => {
        io.emit('emojiBubble', emoji);
    });
});

// Стартиране на сървъра
server.listen(3000, () => {
    console.log('Сървърът работи на http://localhost:${PORT}`');
});
