// document.addEventListener('DOMContentLoaded', function() {
//     // Map category names to grid IDs
//     const categoryGrids = {
//         'MEN': 'men-grid',
//         'WOMEN': 'women-grid',
//         'SOCKS': 'socks-grid',
//         'SALE': 'sale-grid'
//     };

//     // Initialize cart from localStorage
//     let cart = JSON.parse(localStorage.getItem('cart')) || [];
//     updateCartCount();

//     // Load products and render by category
//     async function loadProducts() {
//         try {
//             const response = await fetch('http://localhost:3002/api/products', {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             const products = await response.json();

//             // Clear all grids
//             Object.values(categoryGrids).forEach(gridId => {
//                 const grid = document.getElementById(gridId);
//                 grid.innerHTML = '';
//             });

//             // Group products by category (case-insensitive)
//             const productsByCategory = { 'MEN': [], 'WOMEN': [], 'SOCKS': [], 'SALE': [] };
//             products.forEach(product => {
//                 const categoryKey = Object.keys(productsByCategory).find(key => 
//                     key.toUpperCase() === (product.category_name || '').toUpperCase());
//                 if (categoryKey) {
//                     productsByCategory[categoryKey].push(product);
//                 }
//             });

//             // Render products in each category
//             Object.keys(productsByCategory).forEach(category => {
//                 const grid = document.getElementById(categoryGrids[category]);
//                 const categoryProducts = productsByCategory[category];

//                 if (categoryProducts.length === 0) {
//                     grid.innerHTML = '<p>No products available in this category.</p>';
//                     return;
//                 }

//                 categoryProducts.forEach(product => {
//                     // Format price
//                     const price = parseFloat(product.price);
//                     const formattedPrice = isNaN(price) ? 'N/A' : `$${price.toFixed(2)}`;

//                     // Check for valid discount
//                     let priceHtml = formattedPrice;
//                     const discountPercentage = product.discount_percentage ? parseFloat(product.discount_percentage) : null;
//                     const hasValidDiscount = discountPercentage && product.discount_code && 
//                         (!product.expiration_date || new Date(product.expiration_date) > new Date('2025-04-18'));
//                     if (hasValidDiscount) {
//                         const discountedPrice = price * (1 - discountPercentage / 100);
//                         priceHtml = `<span style="text-decoration: line-through; color: #888;">${formattedPrice}</span> $${discountedPrice.toFixed(2)}`;
//                     }

//                     // Create product item
//                     const productItem = document.createElement('div');
//                     productItem.className = 'product-item';
//                     productItem.innerHTML = `
//                         <img src="${product.primary_image_url || '/images/placeholder.jpg'}" alt="${product.name || 'Product'}" class="product-image">
//                         <div class="product-details">
//                             <h2 class="product-name">${product.name || 'N/A'}</h2>
//                             <p class="product-price">${priceHtml}</p>
//                             <button class="view-details-btn" data-id="${product.product_id}">View Details</button>
                           
//                         </div>
//                     `;
//                     grid.appendChild(productItem);
//                 });
//             });

//             // Add event listeners to "View Details" buttons
//             document.querySelectorAll('.view-details-btn').forEach(button => {
//                 button.addEventListener('click', function() {
//                     const productId = this.getAttribute('data-id');
//                     window.location.href = `product-details.html?product_id=${productId}`;
//                 });
//             });

//             // Add event listeners to "Add to Cart" buttons
//             document.querySelectorAll('.add-to-cart-btn').forEach(button => {
//                 button.addEventListener('click', function() {
//                     const productId = this.getAttribute('data-id');
//                     const name = this.getAttribute('data-name');
//                     const price = parseFloat(this.getAttribute('data-price'));

//                     // Add product to cart
//                     addToCart({ product_id: productId, name, price });
//                     alert(`${name} has been added to your cart!`);
//                 });
//             });
//         } catch (error) {
//             console.error('Error loading products:', error.message);
//             Object.values(categoryGrids).forEach(gridId => {
//                 const grid = document.getElementById(gridId);
//                 grid.innerHTML = `<p>Error loading products: ${error.message}</p>`;
//             });
//         }
//     }

//     // Function to add a product to the cart
//     function addToCart(product) {
//         // Check if product already exists in cart
//         const existingItem = cart.find(item => item.product_id === product.product_id);
//         if (existingItem) {
//             existingItem.quantity += 1;
//         } else {
//             cart.push({ ...product, quantity: 1 });
//         }

//         // Save cart to localStorage
//         localStorage.setItem('cart', JSON.stringify(cart));
//         updateCartCount();
//     }

//     // Function to update cart count in the header
//     function updateCartCount() {
//         const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//         const cartCountElement = document.getElementById('cart-count');
//         if (cartCountElement) {
//             cartCountElement.textContent = `Cart: ${totalItems} items`;
//         }
//     }

//     // Initial load
//     loadProducts();
// });

document.addEventListener('DOMContentLoaded', function() {
    // Map category names to grid IDs
    const categoryGrids = {
        'MEN': 'men-grid',
        'WOMEN': 'women-grid',
        'SOCKS': 'socks-grid',
        'SALE': 'sale-grid'
    };

    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Extract product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const targetProductId = urlParams.get('id');

    // Load products and render by category
    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:3002/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const products = await response.json();

            // Clear all grids
            Object.values(categoryGrids).forEach(gridId => {
                const grid = document.getElementById(gridId);
                grid.innerHTML = '';
            });

            // Group products by category (case-insensitive)
            const productsByCategory = { 'MEN': [], 'WOMEN': [], 'SOCKS': [], 'SALE': [] };
            products.forEach(product => {
                const categoryKey = Object.keys(productsByCategory).find(key => 
                    key.toUpperCase() === (product.category_name || '').toUpperCase());
                if (categoryKey) {
                    productsByCategory[categoryKey].push(product);
                }
            });

            let foundTargetProduct = false;

            // Render products in each category
            Object.keys(productsByCategory).forEach(category => {
                const grid = document.getElementById(categoryGrids[category]);
                const categoryProducts = productsByCategory[category];

                if (categoryProducts.length === 0) {
                    grid.innerHTML = '<p>No products available in this category.</p>';
                    return;
                }

                categoryProducts.forEach(product => {
                    // Format price
                    const price = parseFloat(product.price);
                    const formattedPrice = isNaN(price) ? 'N/A' : `$${price.toFixed(2)}`;

                    // Check for valid discount
                    let priceHtml = formattedPrice;
                    const discountPercentage = product.discount_percentage ? parseFloat(product.discount_percentage) : null;
                    const hasValidDiscount = discountPercentage && product.discount_code && 
                        (!product.expiration_date || new Date(product.expiration_date) > new Date());
                    if (hasValidDiscount) {
                        const discountedPrice = price * (1 - discountPercentage / 100);
                        priceHtml = `<span style="text-decoration: line-through; color: #888;">${formattedPrice}</span> $${discountedPrice.toFixed(2)}`;
                    }

                    // Create product item
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.setAttribute('data-id', product.product_id); // Add data-id for targeting
                    productItem.innerHTML = `
                        <img src="${product.primary_image_url || '/images/placeholder.jpg'}" alt="${product.name || 'Product'}" class="product-image">
                        <div class="product-details">
                            <h2 class="product-name">${product.name || 'N/A'}</h2>
                            <p class="product-price">${priceHtml}</p>
                            <button class="view-details-btn" data-id="${product.product_id}">View Details</button>
                        </div>
                    `;
                    grid.appendChild(productItem);

                    // Check if this is the target product
                    if (targetProductId && product.product_id === targetProductId) {
                        foundTargetProduct = true;
                        productItem.classList.add('highlight'); // Add highlight class
                    }
                });
            });

            // Add event listeners to "View Details" buttons
            document.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    window.location.href = `product-details.html?id=${productId}`; // Changed to use 'id' to match product-details.html
                });
            });

            // Scroll to the target product if it exists
            if (targetProductId) {
                const targetProduct = document.querySelector(`.product-item[data-id="${targetProductId}"]`);
                if (targetProduct) {
                    targetProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (!foundTargetProduct) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.style.color = '#e53e3e';
                    errorMessage.style.textAlign = 'center';
                    errorMessage.style.margin = '20px';
                    errorMessage.textContent = `Product with ID ${targetProductId} not found.`;
                    document.querySelector('.product-listing').prepend(errorMessage);
                }
            }

        } catch (error) {
            console.error('Error loading products:', error.message);
            Object.values(categoryGrids).forEach(gridId => {
                const grid = document.getElementById(gridId);
                grid.innerHTML = `<p>Error loading products: ${error.message}</p>`;
            });
        }
    }

    // Function to add a product to the cart
    function addToCart(product) {
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.product_id === product.product_id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Function to update cart count in the header
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = `Cart: ${totalItems} items`;
        }
    }

    // Add highlight style
    const style = document.createElement('style');
    style.textContent = `
        .product-item.highlight {
            border: 2px solid #10b981;
            background-color: #f0fff4;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
    `;
    document.head.appendChild(style);

    // Initial load
    loadProducts();

    // Session management
    const authLink = document.getElementById('auth-link');
    const userBadge = document.getElementById('user-badge');

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

    checkSession();
    window.addEventListener('storage', async () => await checkSession());
});