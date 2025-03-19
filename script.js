let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;

function showSlide(index) {
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }

    const offset = -currentSlide * 50; // Move 50% for each slide
    document.querySelector('.slides').style.transform = `translateX(${offset}%)`;

    // Update active dot
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

// Auto-slide every 5 seconds
let slideInterval = setInterval(nextSlide, 5000);

// Click event for dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        clearInterval(slideInterval); // Stop auto-slide on manual click
        showSlide(index);
        slideInterval = setInterval(nextSlide, 5000); // Restart auto-slide
    });
});

// Optional: Pause on hover
document.querySelector('.hero-slider').addEventListener('mouseover', () => clearInterval(slideInterval));
document.querySelector('.hero-slider').addEventListener('mouseout', () => slideInterval = setInterval(nextSlide, 10000));


// Carousel Navigation Script
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.featured-stories-container');
    const leftBtn = document.querySelector('.carousel-btn-left');
    const rightBtn = document.querySelector('.carousel-btn-right');
    const storyWidth = 400 + 30; // Width of each story (400px) + gap (30px)

    // Function to update button visibility
    const updateButtonVisibility = () => {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const scrollLeft = container.scrollLeft;

        // Hide left button at the start
        if (scrollLeft <= 0) {
            leftBtn.classList.add('hidden');
        } else {
            leftBtn.classList.remove('hidden');
        }

        // Hide right button at the end
        if (scrollLeft >= maxScrollLeft - 1) { // -1 for small rounding errors
            rightBtn.classList.add('hidden');
        } else {
            rightBtn.classList.remove('hidden');
        }
    };

    // Initial check
    updateButtonVisibility();

    // Scroll left
    leftBtn.addEventListener('click', () => {
        container.scrollBy({
            left: -storyWidth,
            behavior: 'smooth'
        });
    });

    // Scroll right
    rightBtn.addEventListener('click', () => {
        container.scrollBy({
            left: storyWidth,
            behavior: 'smooth'
        });
    });

    // Update button visibility on scroll
    container.addEventListener('scroll', updateButtonVisibility);
});