document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const submitButton = productForm.querySelector('button[type="submit"]');

    // Load products on page load
    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:3001/api/admin/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const products = await response.json();
            productList.innerHTML = '';
            if (products.length === 0) {
                productList.innerHTML = '<tr><td colspan="11">No products found</td></tr>';
                return;
            }
            products.forEach(product => {
                // Ensure price is a number; default to 0 if invalid
                const price = parseFloat(product.price);
                const formattedPrice = isNaN(price) ? 'N/A' : `$${price.toFixed(2)}`;

                // Ensure discount_percentage is a number; default to null if invalid
                const discountPercentage = product.discount_percentage ? parseFloat(product.discount_percentage) : null;
                const formattedDiscount = discountPercentage ? `${discountPercentage.toFixed(1)}%` : 'N/A';

                // Format expiration date
                const expirationDate = product.expiration_date ? new Date(product.expiration_date).toLocaleDateString() : 'N/A';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.product_id || 'N/A'}</td>
                    <td>${product.name || 'N/A'}</td>
                    <td>${product.category_name || 'N/A'}</td>
                    <td>${formattedPrice}</td>
                    <td>${product.stock || 'N/A'}</td>
                    <td>${product.discount_code || 'N/A'}</td>
                    <td>${formattedDiscount}</td>
                    <td>${expirationDate}</td>
                    <td>${product.description || 'N/A'}</td>
                    <td><img src="${product.primary_image_url || '/images/placeholder.jpg'}" alt="${product.name || 'Product'}" width="50"></td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editProduct('${product.product_id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteProduct('${product.product_id}')">Delete</button>
                    </td>
                `;
                productList.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading products:', error.message);
            productList.innerHTML = '<tr><td colspan="11">Failed to load products: ' + error.message + '</td></tr>';
        }
    }

    // Handle form submission (add or edit)
    productForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(productForm);
        const editProductId = document.getElementById('editProductId').value;
        const isEdit = !!editProductId;

        try {
            const url = isEdit ? `http://localhost:3001/api/admin/products/${editProductId}` : 'http://localhost:3001/api/admin/products';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                alert(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
                productForm.reset();
                if (isEdit) {
                    document.getElementById('editProductId').value = '';
                    submitButton.textContent = 'Add Product';
                }
                await loadProducts(); // Refresh product list
            } else {
                throw new Error(result.error || `Failed to ${isEdit ? 'update' : 'add'} product`);
            }
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'adding'} product:`, error.message);
            alert(`Error ${isEdit ? 'updating' : 'adding'} product: ${error.message}`);
        }
    });

    // Edit product
    window.editProduct = async function(id) {
        try {
            const response = await fetch('http://localhost:3001/api/admin/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const products = await response.json();
            const product = products.find(p => p.product_id == id);
            if (!product) {
                throw new Error('Product not found');
            }

            // Populate form with product data
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category_name || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('discountCode').value = product.discount_code || '';
            document.getElementById('discountPercentage').value = product.discount_percentage || '';
            document.getElementById('discountExpiration').value = product.expiration_date
                ? new Date(product.expiration_date).toISOString().split('T')[0]
                : '';
            document.getElementById('productImageUrl').value = product.primary_image_url || '';
            document.getElementById('editProductId').value = id;
            submitButton.textContent = 'Update Product';

            // Scroll to form
            productForm.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading product for edit:', error.message);
            alert('Error loading product for edit: ' + error.message);
        }
    };

    // Delete product
    window.deleteProduct = async function(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/admin/products/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Product deleted successfully');
                    await loadProducts(); // Refresh product list
                } else {
                    throw new Error(result.error || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error.message);
                alert('Error deleting product: ' + error.message);
            }
        }
    };

    // Initial load
    loadProducts();
});