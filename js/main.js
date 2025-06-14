// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Authentication Check
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const authButtons = document.querySelectorAll('.auth-btn');
    const profileLink = document.querySelector('a[href="profile.html"]');
    let links=document.getElementById('nav-links');
    if (isLoggedIn) {
        authButtons[0].style.display = 'none'; // Hide Login
        authButtons[1].textContent = 'Logout';
        authButtons[1].href = '#';
        links.innerHTML=`<a href="index.html" class="active">Home</a>
            <a href="ai.html">AI Features</a>
            <a href="about.html">About Us</a>
            <a href="contact.html">Contact</a>
            <a href="profile.html">Profile</a>`
        authButtons[1].addEventListener('click', logout);
        profileLink.style.display = 'block';
    } else {
        authButtons[0].style.display = 'block';
        authButtons[1].textContent = 'Sign Up';
        authButtons[1].href = 'signup.html';
        profileLink.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .app-card').forEach(element => {
    observer.observe(element);
});

// Form Validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Add error class styling to forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        if (!validateForm(form)) {
            e.preventDefault();
            alert('Please fill in all required fields.');
        }
    });
});

// Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    initializeNavigation();
    
    // Check login status and update UI
    updateUIBasedOnLogin();
});

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

function updateUIBasedOnLogin() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get UI elements
    const getStartedBtn = document.querySelector('.hero-buttons .btn-primary');
    const loginBtn = document.querySelector('a[href="login.html"]');
    const signupBtn = document.querySelector('a[href="signup.html"]');
    const profileLink = document.querySelector('a[href="profile.html"]');
    
    if (isLoggedIn && currentUser) {
        // Hide Get Started button
        if (getStartedBtn) {
            getStartedBtn.style.display = 'none';
        }
        
        // Update navigation
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (profileLink) {
            profileLink.style.display = 'block';
            // Add logout button next to profile
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'auth-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
            profileLink.parentNode.insertBefore(logoutBtn, profileLink.nextSibling);
        }
    } else {
        // Show Get Started button
        if (getStartedBtn) {
            getStartedBtn.style.display = 'inline-flex';
        }
        
        // Update navigation
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
    }
}

function logout() {
    // Clear user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Add styles for the auth buttons
const style = document.createElement('style');
style.textContent = `
    .auth-btn {
        padding: 8px 16px;
        border-radius: 20px;
        background-color: #4a90e2;
        color: white;
        text-decoration: none;
        transition: all 0.3s ease;
    }
    
    .auth-btn:hover {
        background-color: #357abd;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Login Functionality
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please fill in both email and password.');
        return;
    }

    // Simulate user authentication (replace with actual API call)
    const mockUser = {
        email: 'user@example.com',
        password: 'password123'
    };

    if (email === mockUser.email && password === mockUser.password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        alert('Login successful!');
        window.location.href = 'ai.html'; // Redirect to home page
    } else {
        alert('Invalid email or password.');
    }
}

// Attach login handler to the form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});