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
    aiSend.addEventListener('click', async function() {
        var val = aiInput.value.trim();
        if (!val) return;
        addAiMessage(val, 'user');
        aiInput.value = '';

        // Show typing indicator
        var typing = document.createElement('div');
        typing.className = 'ai-msg ai typing-indicator';
        typing.innerHTML = '<i class="fas fa-robot"></i><p>Thinking...</p>';
        aiMessages.appendChild(typing);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        try {
            const token = getToken();
            const response = await fetch('http://localhost:5000/api/ai/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ question: val, context: 'JavaScript course - Async/Await lecture' })
            });
            const data = await response.json();
            typing.remove();
            addAiMessage(data.answer || 'Sorry, I could not answer that right now.', 'ai');
        } catch (err) {
            typing.remove();
            addAiMessage('Could not connect to AI assistant. Make sure the backend server is running.', 'ai');
        }
    });
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') aiSend.click();
    });
}
