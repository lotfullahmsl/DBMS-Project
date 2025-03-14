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
let slideInterval = setInterval(nextSlide, 10000);

// Click event for dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        clearInterval(slideInterval); // Stop auto-slide on manual click
        showSlide(index);
        slideInterval = setInterval(nextSlide, 10000); // Restart auto-slide
    });
});

// Optional: Pause on hover
document.querySelector('.hero-slider').addEventListener('mouseover', () => clearInterval(slideInterval));
document.querySelector('.hero-slider').addEventListener('mouseout', () => slideInterval = setInterval(nextSlide, 10000));