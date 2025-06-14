// About Page JavaScript

// Testimonial Slider
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.testimonial-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentSlide = 0;
    const totalSlides = testimonials.length;
    
    // Initialize slider
    updateSlider();
    
    // Event listeners for controls
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    });
    
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    });
    
    // Auto advance slides
    let slideInterval = setInterval(autoAdvance, 5000);
    
    // Pause auto-advance on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slider.addEventListener('mouseleave', () => {
        slideInterval = setInterval(autoAdvance, 5000);
    });
    
    function updateSlider() {
        testimonials.forEach((testimonial, index) => {
            if (index === currentSlide) {
                testimonial.style.display = 'block';
                testimonial.style.opacity = '0';
                setTimeout(() => {
                    testimonial.style.opacity = '1';
                }, 50);
            } else {
                testimonial.style.display = 'none';
            }
        });
    }
    
    function autoAdvance() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }
});

// Stats Animation
document.addEventListener('DOMContentLoaded', () => {
    const stats = document.querySelectorAll('.stat-card h3');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => {
        observer.observe(stat);
    });
    
    function animateValue(element) {
        const value = element.innerText;
        const suffix = value.match(/[+%]/g) ? value.match(/[+%]/g)[0] : '';
        const finalValue = parseInt(value.replace(/[^0-9]/g, ''));
        let startValue = 0;
        const duration = 2000;
        const increment = finalValue / (duration / 16);
        
        function updateValue() {
            startValue += increment;
            if (startValue < finalValue) {
                element.innerText = Math.floor(startValue) + suffix;
                requestAnimationFrame(updateValue);
            } else {
                element.innerText = value;
            }
        }
        
        updateValue();
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Tech Cards Hover Effect
const techCards = document.querySelectorAll('.tech-card');

techCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
}); 