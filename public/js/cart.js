document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartCount = document.getElementById('cart-count');
  const summaryItemCount = document.getElementById('summary-item-count');
  const subtotal = document.getElementById('subtotal');
  const tax = document.getElementById('tax');
  const total = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
      emptyCartMessage.textContent = 'Please log in to view your cart.';
      emptyCartMessage.style.display = 'block';
      return;
    }

    fetch('/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.message || 'Unknown error'}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('Received cart data:', data);
        if (data.success) {
          const cartItems = data.cartItems || [];
          cartItemsContainer.innerHTML = '';
          if (cartItems.length > 0) {
            let totalPrice = 0;
            cartItems.forEach((item) => {
              const cartItem = document.createElement('div');
              cartItem.className = 'cart-item';
              cartItem.dataset.itemId = item.cart_item_id;
              cartItem.dataset.productId = item.product_id; // Store product_id in dataset
              cartItem.dataset.price = item.price;
              cartItem.innerHTML = `
                <img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}" class="cart-item-image" />
                <div class="cart-item-details">
                  <h3>${item.name}</h3>
                  <p class="item-style">Style: ${item.style || 'N/A'}</p>
                  <p class="item-size">Size: ${item.size || 'N/A'}</p>
                  <p class="item-price">$${item.price} x <span class="quantity" data-item-id="${item.cart_item_id}">${item.quantity}</span> = $${(item.price * item.quantity).toFixed(2)}</p>
                  <div class="quantity-control">
                    <button class="quantity-btn decrease" aria-label="Decrease Quantity" data-item-id="${item.cart_item_id}">
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display" data-item-id="${item.cart_item_id}">${item.quantity}</span>
                    <button class="quantity-btn increase" aria-label="Increase Quantity" data-item-id="${item.cart_item_id}">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="cart-item-actions">
                  <button class="action-btn remove-btn" data-item-id="${item.cart_item_id}" aria-label="Remove Item">
                    <i class="fas fa-trash"></i> Remove
                  </button>
                </div>
              `;
              cartItemsContainer.appendChild(cartItem);
              totalPrice += item.price * item.quantity;
            });

            let taxRate = 0;
            if (totalPrice < 100) {
              taxRate = 0.03; // 3% tax
            } else if (totalPrice >= 100 && totalPrice < 500) {
              taxRate = 0.02; // 2% tax
            } else {
              taxRate = 0; // No tax for $500 and above
            }

            const taxAmount = totalPrice * taxRate;
            const finalTotal = totalPrice + taxAmount;

            cartCount.textContent = cartItems.length;
            summaryItemCount.textContent = cartItems.length;
            subtotal.textContent = totalPrice.toFixed(2);
            tax.textContent = taxAmount.toFixed(2);
            total.textContent = finalTotal.toFixed(2);
          } else {
            emptyCartMessage.textContent = 'Your cart is empty.';
            emptyCartMessage.style.display = 'block';
            cartCount.textContent = '0';
            summaryItemCount.textContent = '0';
            subtotal.textContent = '0.00';
            tax.textContent = '0.00';
            total.textContent = '0.00';
            checkoutBtn.disabled = true; // Disable checkout button if cart is empty
          }
        } else {
          emptyCartMessage.textContent = data.message || 'Failed to load cart.';
          emptyCartMessage.style.display = 'block';
        }
      })
      .catch((error) => {
        console.error('Error loading cart:', error);
        emptyCartMessage.textContent = 'Server error: ' + error.message;
        emptyCartMessage.style.display = 'block';
      });
  }

  loadCart();

  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.quantity-btn');
    if (!btn) return;

    const itemId = btn.dataset.itemId;
    const quantityDisplay = document.querySelector(`.quantity-display[data-item-id="${itemId}"]`);
    let quantity = parseInt(quantityDisplay.textContent);
    const price = parseFloat(document.querySelector(`.cart-item[data-item-id="${itemId}"]`).dataset.price);

    let newQuantity = quantity;
    if (btn.classList.contains('decrease') && quantity > 1) {
      newQuantity--;
    } else if (btn.classList.contains('increase')) {
      newQuantity++;
    } else {
      return;
    }

    updateItemQuantity(itemId, newQuantity, price, quantityDisplay, quantity);
  });

  cartItemsContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-btn');
    if (removeBtn) {
      const itemId = removeBtn.dataset.itemId;
      removeFromCart(itemId);
    }
  });

  // Handle checkout button click
  checkoutBtn.addEventListener('click', () => {
    const cartItems = Array.from(document.querySelectorAll('.cart-item')).map(item => ({
      cartItemId: item.dataset.itemId,
      productId: item.dataset.productId, // Use the stored product_id
      name: item.querySelector('h3').textContent,
      style: item.querySelector('.item-style').textContent.replace('Style: ', ''),
      size: item.querySelector('.item-size').textContent.replace('Size: ', ''),
      price: parseFloat(item.dataset.price),
      quantity: parseInt(item.querySelector('.quantity-display').textContent),
      imageUrl: item.querySelector('img').src
    }));

    const orderData = {
      items: cartItems,
      subtotal: parseFloat(subtotal.textContent),
      tax: parseFloat(tax.textContent),
      total: parseFloat(total.textContent),
      shipping: 0 // Assume shipping is free or adjust as needed
    };

    if (cartItems.length === 0) {
      alert('Your cart is empty. Add items to proceed to checkout.');
      return;
    }

    // Store order data in localStorage
    localStorage.setItem('checkoutData', JSON.stringify(orderData));

    // Redirect to checkout page
    window.location.href = 'checkout.html';
  });

  function updateItemQuantity(itemId, newQuantity, price, quantityDisplay, originalQuantity) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to update your cart.');
      return;
    }

    fetch('/api/cart/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cart_item_id: itemId, quantity: newQuantity }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.message || 'Unknown error'}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          quantityDisplay.textContent = newQuantity;
          const itemPriceElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .item-price`);
          const totalPrice = price * newQuantity;
          itemPriceElement.innerHTML = `$${price} x <span class="quantity" data-item-id="${itemId}">${newQuantity}</span> = $${totalPrice.toFixed(2)}`;
          loadCart();
        } else {
          quantityDisplay.textContent = originalQuantity;
          if (data.message && data.message.toLowerCase().includes('out of stock')) {
            alert('Item is out of stock, no more available.');
          } else {
            alert(data.message || 'Failed to update quantity.');
          }
        }
      })
      .catch((error) => {
        console.error('Error updating quantity:', error);
        quantityDisplay.textContent = originalQuantity;
        alert('Server error: ' + error.message);
      });
  }

  function removeFromCart(itemId) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to remove items from your cart.');
      return;
    }

    fetch('/api/cart/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cart_item_id: itemId }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.message || 'Unknown error'}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          alert('Item removed from cart!');
          loadCart();
        } else {
          alert(data.message || 'Failed to remove item.');
        }
      })
      .catch((error) => {
        console.error('Error removing from cart:', error);
        alert('Server error: ' + error.message);
      });
  }
});