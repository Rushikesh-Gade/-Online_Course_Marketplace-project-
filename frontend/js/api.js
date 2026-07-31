// ===== LearnHub API Configuration =====
const API_URL = 'http://localhost:5000/api';

// Save token and user to localStorage
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Get token
function getToken() {
    return localStorage.getItem('token');
}

// Get current user
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Check if logged in
function isLoggedIn() {
    return !!getToken();
}

// Redirect based on role after login
function redirectAfterLogin(role) {
    if (role === 'admin') window.location.href = 'admin.html';
    else if (role === 'instructor') window.location.href = 'dashboard-instructor.html';
    else window.location.href = 'dashboard-student.html';
}

// Generic API call function
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(API_URL + endpoint, options);
    return response.json();
}

// ===== SMART LOGO REDIRECT =====
// When page loads, set logo link based on login status
document.addEventListener('DOMContentLoaded', function() {
    var logoLink = document.getElementById('logoLink');
    if (logoLink) {
        if (isLoggedIn()) {
            var u = getUser();
            if (u && u.role === 'instructor') logoLink.href = 'dashboard-instructor.html';
            else if (u && u.role === 'admin') logoLink.href = 'admin.html';
            else logoLink.href = 'dashboard-student.html';
        } else {
            logoLink.href = 'index.html';
        }
    }
});
