// ===== SOCKET.IO - REAL TIME STUDY ROOM =====
const SOCKET_URL = 'http://localhost:5000';
const roomId = new URLSearchParams(window.location.search).get('room') || 'course-1';
const user = JSON.parse(localStorage.getItem('user') || '{"first_name":"Student","id":0}');
const userName = user.first_name || 'Student';

let socket = null;

// Connect to Socket.io server
if (typeof io !== 'undefined') {
    socket = io(SOCKET_URL);

    socket.on('connect', function() {
        console.log('Connected to study room server');
        socket.emit('join-room', {
            roomId: roomId,
            user: { name: userName, id: user.id, status: 'studying' }
        });
    });

    // Update members list
    socket.on('room-users', function(users) {
        const membersList = document.querySelector('.members-list');
        if (!membersList) return;
        membersList.innerHTML = '';
        users.forEach(function(u) {
            const item = document.createElement('div');
            item.className = 'member-item' + (u.id === user.id ? ' you' : '');
            item.innerHTML = `
                <div class="member-avatar online"><i class="fas fa-user"></i></div>
                <div class="member-info">
                    <span>${u.name}${u.id === user.id ? ' (You)' : ''}</span>
                    <small>${u.status || 'Studying'}</small>
                </div>
                <span class="member-status studying">Studying</span>
            `;
            membersList.appendChild(item);
        });
        // Update online count
        const countEl = document.querySelector('.members-count');
        if (countEl) countEl.textContent = users.length;
        const onlineBadge = document.querySelector('.online-badge');
        if (onlineBadge) onlineBadge.innerHTML = `<span class="online-dot"></span> ${users.length} online`;
    });

    // Receive chat messages
    socket.on('chat-message', function(data) {
        if (data.user && data.user.id !== user.id) {
            addReceivedMsg(data.user.name, data.message, data.time);
        }
    });

    // Receive notes update
    socket.on('notes-updated', function(data) {
        const notesArea = document.querySelector('.shared-notes-area');
        if (notesArea && document.activeElement !== notesArea) {
            notesArea.value = data.notes;
        }
    });

    // User joined/left notifications
    socket.on('user-joined', function(data) { addSystemMsg(data.message); });
    socket.on('user-left', function(data) { addSystemMsg(data.message); });

    socket.on('disconnect', function() { console.log('Disconnected from study room'); });
}

// Add received chat message
function addReceivedMsg(name, message, time) {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `
        <div class="chat-avatar"><i class="fas fa-user"></i></div>
        <div class="chat-bubble">
            <span class="chat-name">${name}</span>
            <p>${message}</p>
            <span class="chat-time">${time || ''}</span>
        </div>
    `;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add system message
function addSystemMsg(message) {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align:center;padding:6px;font-size:0.75rem;color:var(--text-muted);';
    msg.textContent = message;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Shared notes - broadcast to room
const notesArea = document.querySelector('.shared-notes-area');
let notesTimeout;
if (notesArea && socket) {
    notesArea.addEventListener('input', function() {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(function() {
            socket.emit('update-notes', { roomId, notes: notesArea.value });
        }, 500);
    });
}

// ===== FOCUS TIMER =====
var timerInterval = null;
var timerSeconds = 25 * 60;
var timerRunning = false;

function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

var display = document.querySelector('.timer-display');
var startBtn = document.querySelector('.start-timer');
var resetBtn = document.querySelector('.reset-timer');

if (startBtn) {
    startBtn.addEventListener('click', function() {
        if (!timerRunning) {
            timerRunning = true;
            this.innerHTML = '<i class="fas fa-pause"></i> Pause';
            timerInterval = setInterval(function() {
                timerSeconds--;
                display.textContent = formatTime(timerSeconds);
                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
                    timerSeconds = 25 * 60;
                    display.textContent = formatTime(timerSeconds);
                    alert('Time\'s up! Take a short break.');
                }
            }, 1000);
        } else {
            timerRunning = false;
            clearInterval(timerInterval);
            this.innerHTML = '<i class="fas fa-play"></i> Start';
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerSeconds = 25 * 60;
        display.textContent = formatTime(timerSeconds);
        if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    });
}

document.querySelectorAll('.preset-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        clearInterval(timerInterval);
        timerRunning = false;
        timerSeconds = parseInt(this.dataset.mins) * 60;
        display.textContent = formatTime(timerSeconds);
        if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    });
});

// ===== CHAT =====
var chatInput = document.getElementById('chatInput');
var chatSend = document.getElementById('chatSend');
var chatMessages = document.querySelector('.chat-messages');

function addChatMsg(text) {
    var msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg-you';
    msg.innerHTML = `
        <div class="chat-bubble you-bubble">
            <span class="chat-name">You</span>
            <p>${text}</p>
            <span class="chat-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
        </div>
        <div class="chat-avatar you-avatar"><i class="fas fa-user"></i></div>
    `;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatSend) {
    chatSend.addEventListener('click', function() {
        var val = chatInput.value.trim();
        if (!val) return;
        addChatMsg(val);
        // Emit to socket if connected
        if (socket) {
            socket.emit('chat-message', {
                roomId,
                user: { name: userName, id: user.id },
                message: val
            });
        }
        chatInput.value = '';
    });
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') chatSend.click();
    });
}
