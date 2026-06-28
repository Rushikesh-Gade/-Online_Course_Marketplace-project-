// ===== SHOW/HIDE PASSWORD =====
document.querySelectorAll('.toggle-password').forEach(function(icon) {
    icon.addEventListener('click', function() {
        var input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// ===== ROLE SELECTOR =====
document.querySelectorAll('.role-option').forEach(function(option) {
    option.addEventListener('click', function() {
        document.querySelectorAll('.role-option').forEach(function(o) {
            o.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// ===== PASSWORD STRENGTH =====
var passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        var val = this.value;
        var fill = document.querySelector('.strength-fill');
        var text = document.querySelector('.strength-text');
        if (!fill) return;

        var strength = 0;
        if (val.length >= 8) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[^A-Za-z0-9]/.test(val)) strength++;

        var levels = [
            { width: '0%',   color: '#444',    label: 'Enter a password' },
            { width: '25%',  color: '#ef4444', label: 'Weak' },
            { width: '50%',  color: '#f59e0b', label: 'Fair' },
            { width: '75%',  color: '#7c3aed', label: 'Good' },
            { width: '100%', color: '#10b981', label: 'Strong' }
        ];

        fill.style.width = levels[strength].width;
        fill.style.background = levels[strength].color;
        if (text) text.textContent = val.length === 0 ? 'Enter a password' : levels[strength].label;
    });
}
