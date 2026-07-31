// ===== STUDENT DASHBOARD =====

// Check if logged in, redirect if not
if (!isLoggedIn()) {
    window.location.href = 'login.html';
}

const user = getUser();

// Update user name in welcome banner
document.querySelector('.welcome-banner h2').innerHTML =
    `Welcome back, <span class="highlight">${user ? user.first_name : 'Student'}!</span> 👋`;

// Update topbar avatar name
const avatarName = document.querySelector('.topbar-avatar span');
if (avatarName) avatarName.textContent = user ? user.first_name : 'Student';

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const data = await apiCall('/users/dashboard');
        if (data.success) {
            const stats = data.stats;
            const statCards = document.querySelectorAll('.stat-card h3');
            if (statCards[0]) statCards[0].textContent = stats.enrolled;
            if (statCards[1]) statCards[1].textContent = stats.completed;
            if (statCards[2]) statCards[2].textContent = stats.certificates;
        }
    } catch (err) {
        console.log('Could not load stats:', err);
    }
}

// Load enrolled courses
async function loadEnrolledCourses() {
    try {
        const data = await apiCall('/enrollments/my-courses');
        if (data.success && data.enrollments.length > 0) {
            const container = document.querySelector('.progress-courses');
            if (!container) return;
            container.innerHTML = '';

            data.enrollments.slice(0, 3).forEach(enrollment => {
                const card = document.createElement('div');
                card.className = 'progress-card';
                card.innerHTML = `
                    <div class="progress-thumb"><i class="fas fa-book-open"></i></div>
                    <div class="progress-info">
                        <h3>${enrollment.title}</h3>
                        <p><i class="fas fa-user"></i> ${enrollment.first_name} ${enrollment.last_name}</p>
                        <div class="progress-bar-wrap">
                            <div class="progress-bar-fill" style="width:${enrollment.progress_percent || 0}%;"></div>
                        </div>
                        <div class="progress-meta">
                            <span>${enrollment.progress_percent || 0}% complete</span>
                        </div>
                        <a href="learn.html" class="btn-primary btn-sm">Continue <i class="fas fa-play"></i></a>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (err) {
        console.log('Could not load courses:', err);
    }
}

// Load certificates
async function loadCertificates() {
    try {
        const data = await apiCall('/users/certificates');
        if (data.success && data.certificates.length > 0) {
            const container = document.querySelector('.cert-list');
            if (!container) return;
            container.innerHTML = '';

            data.certificates.forEach(cert => {
                const item = document.createElement('div');
                item.className = 'cert-item';
                item.innerHTML = `
                    <div class="cert-icon"><i class="fas fa-certificate"></i></div>
                    <div>
                        <h4>${cert.course_title}</h4>
                        <p>Completed on ${new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                    <a href="#" class="btn-outline btn-xs"><i class="fas fa-download"></i> Download</a>
                `;
                container.appendChild(item);
            });
        }
    } catch (err) {
        console.log('Could not load certificates:', err);
    }
}

// Logout button
document.querySelectorAll('.nav-item').forEach(item => {
    if (item.textContent.includes('Logout')) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Load all data
loadDashboardStats();
loadEnrolledCourses();
loadCertificates();
