// document.addEventListener('DOMContentLoaded', async () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('product_id');
//     const errorMessage = document.getElementById('error-message');
//     const productImage = document.getElementById('product-image');
//     const productName = document.getElementById('product-name');
//     const productDescription = document.getElementById('product-description');
//     const priceSection = document.getElementById('price-section');
//     const stockInfo = document.getElementById('stock-info');
//     const discountInfo = document.getElementById('discount-info');
//     const addToCartButton = document.querySelector('.add-to-cart-btn');
//     const checkoutButton = document.querySelector('.checkout-btn');

//     if (!productId) {
//         errorMessage.textContent = 'Product ID not provided.';
//         errorMessage.style.display = 'block';
//         return;
//     }

//     try {
//         const response = await fetch(`http://localhost:3002/api/products/${productId}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const product = await response.json();

//         // Populate product details
//         productImage.src = product.primary_image_url || '/images/default.jpg';
//         productImage.alt = product.name;
//         productName.textContent = product.name;
//         productDescription.textContent = product.description || 'No description available.';

//         // Parse price and discount as numbers
//         const price = parseFloat(product.price);
//         const discountPercentage = product.discount_percentage ? parseFloat(product.discount_percentage) : 0;

//         // Price and discount
//         if (discountPercentage && new Date(product.expiration_date) > new Date()) {
//             const discountedPrice = (price * (1 - discountPercentage / 100)).toFixed(2);
//             priceSection.innerHTML = `
//                 <span class="original-price">$${price.toFixed(2)}</span>
//                 <span class="discounted-price">$${discountedPrice}</span>
//             `;
//             discountInfo.textContent = `Discount: ${discountPercentage}% off (Code: ${product.discount_code})`;
//         } else {
//             priceSection.textContent = `$${price.toFixed(2)}`;
//             discountInfo.textContent = '';
//         }

//         // Stock
//         stockInfo.textContent = `Stock: ${product.stock} items available`;

//         // Set the product_id on the Add to Cart button
//         addToCartButton.dataset.productId = product.product_id;

//         // Add event listener for Checkout button
//         checkoutButton.addEventListener('click', () => {
//             alert('Check Out functionality coming soon!');
//             // TODO: Redirect to checkout page or implement cart logic
//         });

//         // Add event listener for Add to Cart button
//         addToCartButton.addEventListener('click', () => addToCart(product.product_id));

//     } catch (error) {
//         console.error('Error loading product details:', error);
//         errorMessage.textContent = `Failed to load product details: ${error.message}`;
//         errorMessage.style.display = 'block';
//     }

//     // Function to add a product to the cart
//     async function addToCart(productId) {
//         const quantity = 1; // Default quantity; adjust if you add a quantity input

//         const token = localStorage.getItem('token');
//         if (!token) {
//             errorMessage.textContent = 'Please log in to add items to your cart.';
//             errorMessage.style.display = 'block';
//             errorMessage.style.color = '#e63946'; // Error color
//             window.location.href = 'signup-signin.html'; // Redirect to login page
//             return;
//         }

//         try {
//             const response = await fetch('/api/cart/add', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ product_id: productId, quantity }),
//             });

//             const errData = await response.json();

//             if (!response.ok) {
//                 if (response.status === 403 && errData.message && errData.message.toLowerCase().includes('stock')) {
//                     errorMessage.textContent = 'Item is out of stock.';
//                     errorMessage.style.color = '#e63946'; // Error color
//                     errorMessage.style.display = 'block';
//                     return; // Exit function to prevent counter update
//                 } else if (response.status === 403) {
//                     errorMessage.textContent = 'Invalid token. Please log in again.';
//                     errorMessage.style.color = '#e63946';
//                     errorMessage.style.display = 'block';
//                     window.location.href = 'signup-signin.html';
//                     return;
//                 } else {
//                     throw new Error(`HTTP error! Status: ${response.status}, Message: ${errData.message || 'Unknown error'}`);
//                 }
//             }

//             if (errData.success) {
//                 // Fetch updated cart to get the correct count
//                 const cartResponse = await fetch('/api/cart', {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });

//                 if (cartResponse.ok) {
//                     const cartData = await cartResponse.json();
//                     if (cartData.success) {
//                         const cartItems = cartData.cartItems || [];
//                         const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//                         const cartCountElement = document.getElementById('cart-count');
//                         if (cartCountElement) {
//                             cartCountElement.textContent = `${totalItems} items`;
//                         }
//                     }
//                 }

//                 // Redirect to cart.html on success
//                 window.location.href = 'cart.html';
//             } else {
//                 errorMessage.textContent = errData.message || 'Failed to add item to cart.';
//                 errorMessage.style.color = '#e63946';
//                 errorMessage.style.display = 'block';
//             }
//         } catch (error) {
//             console.error('Error adding to cart:', error);
//             errorMessage.textContent = 'Server error: ' + error.message;
//             errorMessage.style.color = '#e63946';
//             errorMessage.style.display = 'block';
//         }
//     }
// });

document.addEventListener('DOMContentLoaded', async () => {
    // Extract product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); // Changed from 'product_id' to 'id' to match navigation from product-listing-script.js

    // DOM elements
    const errorMessage = document.getElementById('error-message');
    const productImage = document.getElementById('product-image');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const priceSection = document.getElementById('price-section');
    const stockInfo = document.getElementById('stock-info');
    const discountInfo = document.getElementById('discount-info');
    const addToCartButton = document.querySelector('.add-to-cart-btn');
    const checkoutButton = document.querySelector('.checkout-btn');

    // Session management elements
    const authLink = document.getElementById('auth-link');
    const userBadge = document.getElementById('user-badge');

    if (!productId) {
        errorMessage.textContent = 'Product ID not provided.';
        errorMessage.style.display = 'block';
        return;
    }

    // Initialize cart count on page load
    await updateCartCount();

    try {
        // Fetch product details
        const response = await fetch(`http://localhost:3002/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const product = await response.json();

        // Populate product details
        productImage.src = product.primary_image_url || '/images/default.jpg';
        productImage.alt = product.name || 'Product Image';
        productName.textContent = product.name || 'N/A';
        productDescription.textContent = product.description || 'No description available.';

        // Parse price and discount as numbers
        const price = parseFloat(product.price) || 0;
        const discountPercentage = product.discount_percentage ? parseFloat(product.discount_percentage) : 0;

        // Price and discount
        if (discountPercentage && new Date(product.expiration_date) > new Date()) {
            const discountedPrice = (price * (1 - discountPercentage / 100)).toFixed(2);
            priceSection.innerHTML = `
                <span class="original-price">$${price.toFixed(2)}</span>
                <span class="discounted-price">$${discountedPrice}</span>
            `;
            discountInfo.textContent = `Discount: ${discountPercentage}% off (Code: ${product.discount_code || 'N/A'})`;
        } else {
            priceSection.textContent = `$${price.toFixed(2)}`;
            discountInfo.textContent = '';
        }

        // Stock
        stockInfo.textContent = product.stock != null && product.stock >= 0 ? `Stock: ${product.stock} items available` : 'Stock information unavailable';

        // Set the product_id on the Add to Cart button
        addToCartButton.dataset.productId = product.product_id;

        // Add event listener for Checkout button
        checkoutButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                errorMessage.textContent = 'Please log in to proceed to checkout.';
                errorMessage.style.display = 'block';
                errorMessage.style.color = '#e63946';
                window.location.href = 'signup-signin.html';
                return;
            }
            // Redirect to cart page if the user is logged in
            window.location.href = 'cart.html';
        });

        // Add event listener for Add to Cart button
        addToCartButton.addEventListener('click', () => addToCart(product.product_id));

    } catch (error) {
        console.error('Error loading product details:', error);
        errorMessage.textContent = `Failed to load product details: ${error.message}`;
        errorMessage.style.display = 'block';
    }

    // Function to add a product to the cart
    async function addToCart(productId) {
        const quantity = 1; // Default quantity; adjust if you add a quantity input

        const token = localStorage.getItem('token');
        if (!token) {
            errorMessage.textContent = 'Please log in to add items to your cart.';
            errorMessage.style.display = 'block';
            errorMessage.style.color = '#e63946';
            window.location.href = 'signup-signin.html';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/cart/add', { // Updated to port 3000 for consistency with session management
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            const errData = await response.json();

            if (!response.ok) {
                if (response.status === 403 && errData.message && errData.message.toLowerCase().includes('stock')) {
                    errorMessage.textContent = 'Item is out of stock.';
                    errorMessage.style.color = '#e63946';
                    errorMessage.style.display = 'block';
                    return;
                } else if (response.status === 403) {
                    errorMessage.textContent = 'Invalid token. Please log in again.';
                    errorMessage.style.color = '#e63946';
                    errorMessage.style.display = 'block';
                    window.location.href = 'signup-signin.html';
                    return;
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errData.message || 'Unknown error'}`);
                }
            }

            if (errData.success) {
                // Update cart count after adding item
                await updateCartCount();
                // Redirect to cart.html on success
                window.location.href = 'cart.html';
            } else {
                errorMessage.textContent = errData.message || 'Failed to add item to cart.';
                errorMessage.style.color = '#e63946';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            errorMessage.textContent = 'Server error: ' + error.message;
            errorMessage.style.color = '#e63946';
            errorMessage.style.display = 'block';
        }
    }

    // Function to update cart count
    async function updateCartCount() {
        const token = localStorage.getItem('token');
        const cartCountElement = document.getElementById('cart-count');
        if (!cartCountElement) return;

        if (!token) {
            cartCountElement.textContent = 'Cart: 0 items';
            return;
        }

        try {
            const cartResponse = await fetch('http://localhost:3000/api/cart', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                if (cartData.success) {
                    const cartItems = cartData.cartItems || [];
                    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                    cartCountElement.textContent = `Cart: ${totalItems} items`;
                } else {
                    cartCountElement.textContent = 'Cart: 0 items';
                }
            } else {
                cartCountElement.textContent = 'Cart: 0 items';
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
            cartCountElement.textContent = 'Cart: 0 items';
        }
    }

    // Session management
    async function checkSession() {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                authLink.classList.remove('hidden');
                userBadge.classList.add('hidden');
                return false;
            }

            const response = await fetch('http://localhost:3000/api/check-session', {
                method: 'GET',
                headers: {
                    'x-session-id': sessionId,
                },
            });
            const result = await response.json();

            if (response.ok && result.valid) {
                authLink.classList.add('hidden');
                userBadge.classList.remove('hidden');
                const userData = JSON.parse(localStorage.getItem('userData')) || {};
                userBadge.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : '?';
                return true;
            } else {
                localStorage.removeItem('sessionId');
                localStorage.removeItem('userData');
                authLink.classList.remove('hidden');
                userBadge.classList.add('hidden');
                return false;
            }
        } catch (error) {
            console.error('Error checking session:', error);
            authLink.classList.remove('hidden');
            userBadge.classList.add('hidden');
            return false;
        }
    }

    // Initialize session management
    checkSession();
    window.addEventListener('storage', async () => await checkSession());
});