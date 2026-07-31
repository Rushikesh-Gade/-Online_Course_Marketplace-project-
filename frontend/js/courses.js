// ===== COURSES PAGE =====
const API_URL = 'http://localhost:5000/api';

let currentPage = 1;
let currentFilters = {};

// Fetch and display courses
async function loadCourses(page = 1, filters = {}) {
    const grid = document.querySelector('.courses-grid-page');
    const resultsCount = document.querySelector('.results-count');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i></div>';

    let query = `?page=${page}&limit=6`;
    if (filters.search) query += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.category) query += `&category=${filters.category}`;
    if (filters.difficulty) query += `&difficulty=${filters.difficulty}`;
    if (filters.sort) query += `&sort=${filters.sort}`;

    try {
        const response = await fetch(API_URL + '/courses' + query);
        const data = await response.json();

        if (data.success && data.courses.length > 0) {
            if (resultsCount) resultsCount.innerHTML = `<strong>${data.total}</strong> courses found`;
            grid.innerHTML = '';

            data.courses.forEach(course => {
                const card = createCourseCard(course);
                grid.appendChild(card);
            });

            updatePagination(data.total, page);
        } else {
            grid.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted);"><i class="fas fa-search" style="font-size:3rem;margin-bottom:16px;display:block;"></i><p>No courses found. Try different filters.</p></div>';
        }
    } catch (err) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Could not load courses. Make sure the server is running.</div>';
    }
}

// Create a course card element
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    const stars = generateStars(course.avg_rating);
    const price = course.price > 0 ? `₹${course.price}` : 'Free';

    card.innerHTML = `
        <div class="course-thumb">
            <div class="thumb-placeholder"><i class="fas fa-book-open"></i></div>
        </div>
        <div class="course-body">
            <span class="course-category">${course.category_name}</span>
            <h3>${course.title}</h3>
            <p class="course-instructor"><i class="fas fa-user"></i> ${course.first_name} ${course.last_name}</p>
            <div class="course-rating">
                ${stars}
                <span>${parseFloat(course.avg_rating).toFixed(1)} (${course.total_reviews.toLocaleString()})</span>
            </div>
            <div class="course-meta">
                <i class="fas fa-clock"></i> ${course.total_hours}h &nbsp;|&nbsp;
                <i class="fas fa-film"></i> ${course.total_lectures} lectures &nbsp;|&nbsp;
                <i class="fas fa-signal"></i> ${course.difficulty}
            </div>
            <div class="course-footer">
                <span class="course-price">${price}</span>
                <a href="course-detail.html?id=${course.id}" class="btn-enroll">View Course</a>
            </div>
        </div>
    `;
    return card;
}

// Generate star icons based on rating
function generateStars(rating) {
    let stars = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-stroke"></i>';
    return stars;
}

// Update pagination
function updatePagination(total, page) {
    const totalPages = Math.ceil(total / 6);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = page === 1;
    prevBtn.addEventListener('click', () => { if (page > 1) loadCourses(page - 1, currentFilters); });
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === page ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => loadCourses(i, currentFilters));
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = page === totalPages;
    nextBtn.addEventListener('click', () => { if (page < totalPages) loadCourses(page + 1, currentFilters); });
    pagination.appendChild(nextBtn);
}

// Search
const searchInput = document.querySelector('.header-search input');
const searchBtn = document.querySelector('.header-search .btn-primary');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        currentFilters.search = searchInput.value;
        loadCourses(1, currentFilters);
    });
}
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { currentFilters.search = searchInput.value; loadCourses(1, currentFilters); }
    });
}

// Sort
const sortSelect = document.querySelector('.sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        const sortMap = { 'Highest Rated': 'rating', 'Most Popular': 'popular', 'Newest': 'newest', 'Price: Low to High': 'price_asc', 'Price: High to Low': 'price_desc' };
        currentFilters.sort = sortMap[this.value] || '';
        loadCourses(1, currentFilters);
    });
}

// Initial load
loadCourses(1, {});
