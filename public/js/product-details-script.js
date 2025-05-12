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

//     // Initialize cart from localStorage
//     let cart = JSON.parse(localStorage.getItem('cart')) || [];

//     if (!productId) {
//         errorMessage.textContent = 'Product ID not provided.';
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

//         // Add Check Out button
//         const checkoutButton = document.createElement('button');
//         checkoutButton.className = 'checkout-btn';
//         checkoutButton.textContent = 'Check Out';
//         checkoutButton.addEventListener('click', () => {
//             alert('Check Out functionality coming soon!');
//             // TODO: Redirect to checkout page or implement cart logic
//         });

//         // Add to Cart button
//         const addToCartButton = document.createElement('button');
//         addToCartButton.className = 'add-to-cart-btn';
//         addToCartButton.textContent = 'Add to Cart';
//         addToCartButton.addEventListener('click', () => {
//             const cartItem = {
//                 product_id: product.product_id,
//                 name: product.name,
//                 price: price
//             };
//             addToCart(cartItem);
//             alert(`${product.name} has been added to your cart!`);
//         });

//         // Append buttons to product-details section
//         const buttonContainer = document.createElement('div');
//         buttonContainer.className = 'button-container';
//         buttonContainer.appendChild(addToCartButton);
//         buttonContainer.appendChild(checkoutButton);
//         document.querySelector('.product-details').appendChild(buttonContainer);

//     } catch (error) {
//         console.error('Error loading product details:', error);
//         errorMessage.textContent = `Failed to load product details: ${error.message}`;
//     }

//     // Function to add a product to the cart
//     function addToCart(product) {
//         // Check if product already exists in cart
//         const existingItem = cart.find(item => item.product_id === product.product_id);
//         if (existingItem) {
//             existingItem.quantity = (existingItem.quantity || 1) + 1;
//         } else {
//             cart.push({ ...product, quantity: 1 });
//         }

//         // Save cart to localStorage
//         localStorage.setItem('cart', JSON.stringify(cart));
//         // Update cart count if cart-count element exists
//         const cartCountElement = document.getElementById('cart-count');
//         if (cartCountElement) {
//             const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
//             cartCountElement.textContent = `Cart: ${totalItems} items`;
//         }
//     }
// });

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    const errorMessage = document.getElementById('error-message');
    const productImage = document.getElementById('product-image');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const priceSection = document.getElementById('price-section');
    const stockInfo = document.getElementById('stock-info');
    const discountInfo = document.getElementById('discount-info');
    const addToCartButton = document.querySelector('.add-to-cart-btn');
    const checkoutButton = document.querySelector('.checkout-btn');

    if (!productId) {
        errorMessage.textContent = 'Product ID not provided.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
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
        productImage.alt = product.name;
        productName.textContent = product.name;
        productDescription.textContent = product.description || 'No description available.';

        // Parse price and discount as numbers
        const price = parseFloat(product.price);
        const discountPercentage = product.discount_percentage ? parseFloat(product.discount_percentage) : 0;

        // Price and discount
        if (discountPercentage && new Date(product.expiration_date) > new Date()) {
            const discountedPrice = (price * (1 - discountPercentage / 100)).toFixed(2);
            priceSection.innerHTML = `
                <span class="original-price">$${price.toFixed(2)}</span>
                <span class="discounted-price">$${discountedPrice}</span>
            `;
            discountInfo.textContent = `Discount: ${discountPercentage}% off (Code: ${product.discount_code})`;
        } else {
            priceSection.textContent = `$${price.toFixed(2)}`;
            discountInfo.textContent = '';
        }

        // Stock
        stockInfo.textContent = `Stock: ${product.stock} items available`;

        // Set the product_id on the Add to Cart button
        addToCartButton.dataset.productId = product.product_id;

        // Add event listener for Checkout button
        checkoutButton.addEventListener('click', () => {
            alert('Check Out functionality coming soon!');
            // TODO: Redirect to checkout page or implement cart logic
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
            window.location.href = 'signup-signin.html'; // Redirect to login page
            return;
        }

        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            if (data.success) {
                // Fetch updated cart to get the cart count
                const cartResponse = await fetch('/api/cart', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (cartResponse.ok) {
                    const cartData = await cartResponse.json();
                    if (cartData.success) {
                        const cartItems = cartData.cartItems || [];
                        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                        const cartCountElement = document.getElementById('cart-count');
                        if (cartCountElement) {
                            cartCountElement.textContent = `Cart: ${totalItems} items`;
                        }
                    }
                }

                // Redirect to cart.html on success
                window.location.href = 'cart.html';
            } else {
                errorMessage.textContent = data.message || 'Failed to add item to cart.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            errorMessage.textContent = 'Server error: ' + error.message;
            errorMessage.style.display = 'block';
        }
    }
});