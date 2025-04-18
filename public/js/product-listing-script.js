// Add any JavaScript functionality here if needed
document.addEventListener('DOMContentLoaded', function() {
    // Example: Adding a click event listener to the "View Details" buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('View Details button clicked!');
        });
    });
});
