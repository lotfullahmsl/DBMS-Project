document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');

    productForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const productId = document.getElementById('productId').value;
        const productCategory = document.getElementById('productCategory').value;
        const productPrice = document.getElementById('productPrice').value;
        const productImage = document.getElementById('productImage').files[0];

        if (productImage) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageSrc = e.target.result;
                addProductToList(productId, productCategory, productPrice, imageSrc);
            };
            reader.readAsDataURL(productImage);
        }
    });

    function addProductToList(id, category, price, imageSrc) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${category}</td>
            <td>$${price}</td>
            <td><img src="${imageSrc}" alt="Product Image"></td>
            <td>
                <button class="action-btn" onclick="editProduct('${id}')">Edit</button>
                <button class="action-btn" onclick="deleteProduct('${id}')">Delete</button>
            </td>
        `;
        productList.appendChild(row);

        productForm.reset();
    }

    window.editProduct = function(id) {
        alert('Edit product with ID: ' + id);
    };

    window.deleteProduct = function(id) {
        alert('Delete product with ID: ' + id);
    };
});
