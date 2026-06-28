// ===== TABS =====
document.querySelectorAll('.learn-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.learn-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        this.classList.add('active');
        document.getElementById('tab-' + this.dataset.tab).style.display = 'block';
    });
});

// ===== PLAY BUTTON TOGGLE =====
var playBtn = document.querySelector('.play-btn');
if (playBtn) {
    playBtn.addEventListener('click', function() {
        var icon = this.querySelector('i');
        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    });
}

// ===== AI CHAT =====
var aiInput = document.querySelector('.ai-input-wrap input');
var aiSend = document.querySelector('.ai-send');
var aiMessages = document.querySelector('.ai-messages');

function addAiMessage(text, type) {
    var msg = document.createElement('div');
    msg.className = 'ai-msg ' + type;
    if (type === 'user') {
        msg.innerHTML = '<p>' + text + '</p><i class="fas fa-user"></i>';
    } else {
        msg.innerHTML = '<i class="fas fa-robot"></i><p>' + text + '</p>';
    }
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

if (aiSend) {
    aiSend.addEventListener('click', function() {
        var val = aiInput.value.trim();
        if (!val) return;
        addAiMessage(val, 'user');
        aiInput.value = '';
        setTimeout(function() {
            addAiMessage('That\'s a great question! This topic is covered in depth in the current lecture. Try pausing at the key explanation around the 10-minute mark for a detailed breakdown.', 'ai');
        }, 800);
    });
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') aiSend.click();
    });
}
