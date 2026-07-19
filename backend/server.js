const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static('../frontend'));

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'LearnHub API is running!', time: new Date() });
});

// ===== SOCKET.IO — VIRTUAL STUDY ROOM =====
const studyRooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a study room (one per course)
    socket.on('join-room', ({ roomId, user }) => {
        socket.join(roomId);

        if (!studyRooms[roomId]) studyRooms[roomId] = [];
        studyRooms[roomId] = studyRooms[roomId].filter(u => u.socketId !== socket.id);
        studyRooms[roomId].push({ socketId: socket.id, ...user });

        // Notify everyone in room
        io.to(roomId).emit('room-users', studyRooms[roomId]);
        socket.to(roomId).emit('user-joined', { user, message: `${user.name} joined the study room` });

        console.log(`${user.name} joined room ${roomId}`);
    });

    // Send chat message
    socket.on('chat-message', ({ roomId, user, message }) => {
        io.to(roomId).emit('chat-message', {
            user,
            message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    // Update shared notes
    socket.on('update-notes', ({ roomId, notes }) => {
        socket.to(roomId).emit('notes-updated', { notes });
    });

    // User status update
    socket.on('status-update', ({ roomId, user, status }) => {
        if (studyRooms[roomId]) {
            const userIndex = studyRooms[roomId].findIndex(u => u.socketId === socket.id);
            if (userIndex !== -1) studyRooms[roomId][userIndex].status = status;
            io.to(roomId).emit('room-users', studyRooms[roomId]);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        for (const roomId in studyRooms) {
            const userIndex = studyRooms[roomId].findIndex(u => u.socketId === socket.id);
            if (userIndex !== -1) {
                const user = studyRooms[roomId][userIndex];
                studyRooms[roomId].splice(userIndex, 1);
                io.to(roomId).emit('room-users', studyRooms[roomId]);
                io.to(roomId).emit('user-left', { message: `${user.name} left the study room` });
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 LearnHub server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}\n`);
});
