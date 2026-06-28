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
        chatInput.value = '';
    });
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') chatSend.click();
    });
}
