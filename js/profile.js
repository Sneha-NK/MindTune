// DOM Elements
const profileNav = document.querySelector('.profile-nav');
const profileSections = document.querySelectorAll('.profile-section');
const personalInfoForm = document.getElementById('personalInfoForm');
const securityForm = document.getElementById('securityForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');
const changeAvatarBtn = document.querySelector('.change-avatar-btn');
const profileAvatar = document.getElementById('profileAvatar');

// Initialize the profile page
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeMoodChart();
    setupFormHandlers();
    setupAvatarChange();
});

// Navigation handling
function initializeNavigation() {
    // Show first section by default
    showSection('personal-info');

    // Handle navigation clicks
    profileNav.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const sectionId = e.target.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // Update active state
            document.querySelectorAll('.profile-nav a').forEach(link => {
                link.classList.remove('active');
            });
            e.target.classList.add('active');
        }
    });
}

function showSection(sectionId) {
    profileSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => targetSection.classList.add('active'), 10);
    }
}

// Mood Chart
function initializeMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    
    // Sample data - replace with actual user data
    const moodData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Mood Level',
            data: [85, 72, 78, 75, 82, 88, 85],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: moodData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => `${value}%`
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Form Handlers
function setupFormHandlers() {
    // Personal Information Form
    personalInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(personalInfoForm);
        
        try {
            showLoadingState(personalInfoForm);
            // Simulate API call
            await simulateApiCall();
            
            showSuccessMessage('Personal information updated successfully!');
        } catch (error) {
            showErrorMessage('Failed to update personal information. Please try again.');
        } finally {
            hideLoadingState(personalInfoForm);
        }
    });

    // Security Form
    securityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(securityForm);
        
        if (!validatePasswordForm(formData)) {
            return;
        }

        try {
            showLoadingState(securityForm);
            // Simulate API call
            await simulateApiCall();
            
            showSuccessMessage('Password updated successfully!');
            securityForm.reset();
        } catch (error) {
            showErrorMessage('Failed to update password. Please try again.');
        } finally {
            hideLoadingState(securityForm);
        }
    });

    // Delete Account Form
    deleteAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const confirmText = document.getElementById('deleteConfirm').value;
        
        if (confirmText !== 'DELETE') {
            showErrorMessage('Please type "DELETE" to confirm account deletion.');
            return;
        }

        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            showLoadingState(deleteAccountForm);
            // Simulate API call
            await simulateApiCall();
            
            showSuccessMessage('Account deleted successfully. Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            showErrorMessage('Failed to delete account. Please try again.');
        } finally {
            hideLoadingState(deleteAccountForm);
        }
    });
}

// Avatar Change Handler
function setupAvatarChange() {
    changeAvatarBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    showLoadingState(changeAvatarBtn);
                    // Simulate upload
                    await simulateApiCall();
                    
                    // Preview image
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profileAvatar.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                    
                    showSuccessMessage('Profile picture updated successfully!');
                } catch (error) {
                    showErrorMessage('Failed to update profile picture. Please try again.');
                } finally {
                    hideLoadingState(changeAvatarBtn);
                }
            }
        };
        
        input.click();
    });
}

// Utility Functions
function validatePasswordForm(formData) {
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!currentPassword || !newPassword || !confirmPassword) {
        showErrorMessage('All password fields are required.');
        return false;
    }

    if (newPassword !== confirmPassword) {
        showErrorMessage('New passwords do not match.');
        return false;
    }

    if (newPassword.length < 8) {
        showErrorMessage('New password must be at least 8 characters long.');
        return false;
    }

    return true;
}

function showLoadingState(element) {
    const button = element.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
}

function hideLoadingState(element) {
    const button = element.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || 'Save Changes';
    }
}

function showSuccessMessage(message) {
    // You can implement a toast notification system here
    alert(message);
}

function showErrorMessage(message) {
    // You can implement a toast notification system here
    alert(message);
}

async function simulateApiCall() {
    // Simulate API delay
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Handle notification toggles
document.querySelectorAll('.switch input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
        const notificationType = e.target.closest('.notification-option').querySelector('h4').textContent;
        const isEnabled = e.target.checked;
        
        try {
            // Simulate API call to update notification preferences
            await simulateApiCall();
            showSuccessMessage(`${notificationType} ${isEnabled ? 'enabled' : 'disabled'} successfully!`);
        } catch (error) {
            e.target.checked = !isEnabled; // Revert the toggle
            showErrorMessage(`Failed to update ${notificationType.toLowerCase()} settings.`);
        }
    });
}); 