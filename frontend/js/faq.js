document.querySelectorAll('.faq-question').forEach(function(q) {
    q.addEventListener('click', function() {
        var item = this.parentElement;
        var answer = item.querySelector('.faq-answer');
        var icon = item.querySelector('.fa-chevron-down, .fa-chevron-up');
        var isOpen = answer.style.display !== 'none';
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-question i').forEach(i => { i.classList.remove('fa-chevron-up'); i.classList.add('fa-chevron-down'); });
        if (!isOpen) {
            answer.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    });
});
