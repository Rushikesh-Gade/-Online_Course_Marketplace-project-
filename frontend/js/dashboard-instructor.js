// ===== INSTRUCTOR DASHBOARD =====

if (!isLoggedIn()) window.location.href = 'login.html';

const user = getUser();
if (user && user.role !== 'instructor' && user.role !== 'admin') {
    window.location.href = 'dashboard-student.html';
}

// Update name
const avatarName = document.querySelector('.topbar-avatar span');
if (avatarName) avatarName.textContent = user ? user.first_name : 'Instructor';
const welcomeH2 = document.querySelector('.welcome-banner h2');
if (welcomeH2) welcomeH2.innerHTML = `Welcome back, <span class="highlight">${user ? user.first_name : 'Instructor'}!</span> 👋`;

// Load instructor courses
async function loadInstructorCourses() {
    try {
        const data = await apiCall('/courses/instructor/my-courses');
        if (data.success) {
            const tbody = document.querySelector('.courses-table tbody');
            if (!tbody || data.courses.length === 0) return;
            tbody.innerHTML = '';

            data.courses.forEach(course => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="course-cell">
                        <div class="course-cell-thumb"><i class="fas fa-book-open"></i></div>
                        <span>${course.title}</span>
                    </td>
                    <td>${course.student_count || 0}</td>
                    <td><i class="fas fa-star" style="color:#f59e0b;"></i> ${parseFloat(course.avg_rating || 0).toFixed(1)}</td>
                    <td>₹${(course.student_count * course.price * 0.7).toFixed(0)}</td>
                    <td><span class="status-badge ${course.status}">${course.status}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn"><i class="fas fa-pen"></i></button>
                        <button class="action-btn"><i class="fas fa-eye"></i></button>
                        <button class="action-btn danger"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Update stats
            const statCards = document.querySelectorAll('.stat-card h3');
            const totalStudents = data.courses.reduce((sum, c) => sum + (c.student_count || 0), 0);
            const totalEarnings = data.courses.reduce((sum, c) => sum + (c.student_count * c.price * 0.7), 0);
            if (statCards[1]) statCards[1].textContent = totalStudents.toLocaleString();
            if (statCards[2]) statCards[2].textContent = data.courses.length;
            if (statCards[0]) statCards[0].textContent = `₹${Math.round(totalEarnings).toLocaleString()}`;
        }
    } catch (err) {
        console.log('Could not load instructor courses:', err);
    }
}

// Logout
document.querySelectorAll('.nav-item').forEach(item => {
    if (item.textContent.includes('Logout')) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

loadInstructorCourses();
