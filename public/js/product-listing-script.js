document.addEventListener('DOMContentLoaded', function() {
    // Map category names to grid IDs
    const categoryGrids = {
        'MEN': 'men-grid',
        'WOMEN': 'women-grid',
        'SOCKS': 'socks-grid',
        'SALE': 'sale-grid'
    };

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

            // Group products by category
            const productsByCategory = { 'MEN': [], 'WOMEN': [], 'SOCKS': [], 'SALE': [] };
            products.forEach(product => {
                if (productsByCategory[product.category_name]) {
                    productsByCategory[product.category_name].push(product);
                }
            });

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
                        (!product.expiration_date || new Date(product.expiration_date) > new Date('2025-04-18'));
                    if (hasValidDiscount) {
                        const discountedPrice = price * (1 - discountPercentage / 100);
                        priceHtml = `<span style="text-decoration: line-through; color: #888;">${formattedPrice}</span> $${discountedPrice.toFixed(2)}`;
                    }

                    // Create product item
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.innerHTML = `
                        <img src="${product.primary_image_url || '/images/placeholder.jpg'}" alt="${product.name || 'Product'}" class="product-image">
                        <div class="product-details">
                            <h2 class="product-name">${product.name || 'N/A'}</h2>
                            <p class="product-price">${priceHtml}</p>
                            <button class="view-details-btn" data-id="${product.product_id}">View Details</button>
                        </div>
                    `;
                    grid.appendChild(productItem);
                });
            });

            // Add event listeners to "View Details" buttons
            document.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    alert(`View Details for Product ID: ${productId}`);
                });
            });
        } catch (error) {
            console.error('Error loading products:', error.message);
            Object.values(categoryGrids).forEach(gridId => {
                const grid = document.getElementById(gridId);
                grid.innerHTML = `<p>Error loading products: ${error.message}</p>`;
            });
        }
    }

    // Initial load
    loadProducts();
});