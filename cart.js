document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Toggle for Navbar
    const hamburger = document.querySelector('.hamburger');
    const navbarMenu = document.querySelector('.navbar-menu');

    hamburger.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
    });

    // Cart Functionality
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const summaryItemCountElement = document.getElementById('summary-item-count');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    // Function to update cart totals
    const updateCartTotals = () => {
        let totalItems = 0;
        let subtotal = 0;

        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            const quantity = parseInt(item.querySelector('.quantity').textContent);
            const price = parseFloat(item.dataset.price);
            totalItems += quantity;
            subtotal += price * quantity;
        });

        // Update DOM elements
        cartCountElement.textContent = `${totalItems} items`;
        summaryItemCountElement.textContent = totalItems;
        subtotalElement.textContent = subtotal.toFixed(2);
        totalElement.textContent = subtotal.toFixed(2); // Add tax or shipping if needed

        // Hide cart items section if empty
        if (totalItems === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        }
    };

    // Event delegation for quantity buttons
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.quantity-btn')) {
            const button = e.target.closest('.quantity-btn');
            const itemId = button.dataset.itemId;
            const cartItem = document.getElementById(`cart-item-${itemId}`);
            const quantityElement = cartItem.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent);

            if (button.classList.contains('increase')) {
                quantity++;
            } else if (button.classList.contains('decrease') && quantity > 1) {
                quantity--;
            }

            quantityElement.textContent = quantity;

            // Backend Integration Point:
            // Send updated quantity to backend
            // Example: fetch(`/api/cart/update/${itemId}`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ quantity })
            // });

            updateCartTotals();
        }

        if (e.target.closest('.remove-btn')) {
            const button = e.target.closest('.remove-btn');
            const itemId = button.dataset.itemId;
            const cartItem = document.getElementById(`cart-item-${itemId}`);

            // Remove item from DOM
            cartItem.remove();

            // Backend Integration Point:
            // Send request to remove item from backend
            // Example: fetch(`/api/cart/remove/${itemId}`, {
            //     method: 'DELETE'
            // });

            updateCartTotals();
        }
    });

    // Initial calculation of totals
    updateCartTotals();

    // Placeholder for Edit button (e.g., open a modal to edit size, color, etc.)
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const button = e.target.closest('.edit-btn');
            const itemId = button.dataset.itemId;
            alert(`Edit item with ID: ${itemId}`);
            // Backend Integration Point:
            // Fetch item details and open a modal for editing
            // Example: fetch(`/api/cart/item/${itemId}`)
            //     .then(response => response.json())
            //     .then(data => openEditModal(data));
        }
    });

    // Placeholder for Apply Promo Code (for future backend integration)
    document.getElementById('apply-promo').addEventListener('click', () => {
        const promoCode = document.getElementById('promo-code').value;
        alert(`Promo code applied: ${promoCode}`);
        // Backend Integration Point:
        // Send promo code to backend to validate and apply discount
        // Example: fetch('/api/cart/apply-promo', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ promoCode })
        // });
    });

    // Placeholder for Checkout button
    document.getElementById('checkout-btn').addEventListener('click', () => {
        alert('Proceeding to checkout...');
        // Backend Integration Point:
        // Redirect to checkout page or send cart data to backend
        // Example: window.location.href = '/checkout';
    });

    // Payment Method Selection
    const paymentModal = document.getElementById('payment-modal');
    const selectPaymentBtn = document.getElementById('select-payment-btn');
    const closeModal = document.getElementById('close-modal');
    let selectedPaymentMethod = null;

    // Open modal when "Select Payment Method" is clicked
    selectPaymentBtn.addEventListener('click', () => {
        paymentModal.style.display = 'flex';
    });

    // Close modal when the close button is clicked
    closeModal.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    // Handle payment method selection
    const paymentInputs = document.querySelectorAll('input[name="payment"]');
    paymentInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            selectedPaymentMethod = e.target.value;
            const methodName = e.target.closest('label').querySelector('p').textContent;
            selectPaymentBtn.innerHTML = `<i class="fas fa-credit-card"></i> Pay with ${methodName}`;
            paymentModal.style.display = 'none';

            // Backend Integration Point:
            // Store the selected payment method in the backend or session
            // Example: fetch('/api/cart/set-payment-method', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ paymentMethod: selectedPaymentMethod })
            // });
        });
    });

    // Handle payment button click after selection
    selectPaymentBtn.addEventListener('click', () => {
        if (selectedPaymentMethod) {
            alert(`Initiating payment with ${selectedPaymentMethod}...`);
            // Backend Integration Point:
            // Initiate payment flow based on selected method
            // Example: window.location.href = `/checkout/${selectedPaymentMethod}`;
        }
    });
});