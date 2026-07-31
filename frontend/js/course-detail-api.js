// ===== COURSE DETAIL PAGE - API CONNECTION =====
const API_URL = 'http://localhost:5000/api';

// Get course ID from URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id') || 1; // Default to 1 for demo

// Load course details
async function loadCourseDetail() {
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`);
        const data = await response.json();

        if (!data.success) return;
        const course = data.course;

        // Update page title
        document.title = `${course.title} - LearnHub`;

        // Update hero content
        const h1 = document.querySelector('.course-hero-content h1');
        if (h1) h1.textContent = course.title;

        const tagline = document.querySelector('.course-tagline');
        if (tagline) tagline.textContent = course.description;

        // Update meta bar
        const metaBar = document.querySelector('.course-meta-bar');
        if (metaBar) {
            metaBar.querySelector('strong') && (metaBar.querySelector('strong').textContent = parseFloat(course.avg_rating).toFixed(1));
        }

        // Update instructor
        const instrLine = document.querySelector('.course-instructor-line');
        if (instrLine) instrLine.innerHTML = `Created by <a href="#">${course.first_name} ${course.last_name}</a>`;

        // Update price
        const priceMain = document.querySelector('.price-main');
        if (priceMain) priceMain.textContent = course.price > 0 ? `₹${course.price}` : 'Free';

        // Update enroll button
        const enrollBtn = document.querySelector('.enroll-btn');
        if (enrollBtn) {
            enrollBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleEnroll(course.id, course.price, course.title);
            });
        }

        // Update wishlist button
        const wishlistBtn = document.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addToWishlist(course.id);
            });
        }

    } catch (err) {
        console.log('Could not load course:', err);
    }
}

// Handle enrollment
async function handleEnroll(courseId, price, title) {
    // Check if logged in
    if (!localStorage.getItem('token')) {
        if (confirm('You need to be logged in to enroll. Go to login page?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ course_ids: [courseId] })
        });
        const data = await response.json();

        if (data.success) {
            if (data.redirect) {
                alert(`Successfully enrolled in "${title}"!`);
                window.location.href = data.redirect;
            } else if (data.clientSecret) {
                // Stripe payment flow would go here
                alert('Redirecting to payment...');
            }
        } else {
            alert(data.message || 'Enrollment failed. Please try again.');
        }
    } catch (err) {
        alert('Could not connect to server. Make sure the backend is running.');
    }
}

// Add to wishlist
async function addToWishlist(courseId) {
    if (!localStorage.getItem('token')) {
        alert('Please log in to add to wishlist.');
        return;
    }
    alert('Added to wishlist!');
}

// Load on page ready
loadCourseDetail();
