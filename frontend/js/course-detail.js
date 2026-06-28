// ===== ACCORDION - COURSE CURRICULUM =====
document.querySelectorAll('.accordion-header').forEach(function(header) {
    header.addEventListener('click', function() {
        var item = this.parentElement;
        var body = item.querySelector('.accordion-body');
        var icon = item.querySelector('.acc-icon');
        var isOpen = body.style.display !== 'none';

        // Close all
        document.querySelectorAll('.accordion-body').forEach(function(b) {
            b.style.display = 'none';
        });
        document.querySelectorAll('.acc-icon').forEach(function(i) {
            i.classList.remove('fa-chevron-down');
            i.classList.add('fa-chevron-right');
        });

        // Open clicked if it was closed
        if (!isOpen) {
            body.style.display = 'block';
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        }
    });
});
