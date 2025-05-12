
// document.addEventListener('DOMContentLoaded', () => {
//   const cartItemsContainer = document.getElementById('cart-items');
//   const emptyCartMessage = document.getElementById('empty-cart-message');
//   const cartCount = document.getElementById('cart-count');
//   const summaryItemCount = document.getElementById('summary-item-count');
//   const subtotal = document.getElementById('subtotal');
//   const total = document.getElementById('total');

//   function loadCart() {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       emptyCartMessage.textContent = 'Please log in to view your cart.';
//       emptyCartMessage.style.display = 'block';
//       return;
//     }

//     fetch('/api/cart', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) {
//           return res.json().then((errData) => {
//             throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.message || 'Unknown error'}`);
//           });
//         }
//         return res.json();
//       })
//       .then((data) => {
//         console.log('Received cart data:', data);
//         if (data.success) {
//           const cartItems = data.cartItems || [];
//           cartItemsContainer.innerHTML = '';
//           if (cartItems.length > 0) {
//             let totalPrice = 0;
//             cartItems.forEach((item) => {
//               const cartItem = document.createElement('div');
//               cartItem.className = 'cart-item';
//               cartItem.dataset.itemId = item.cart_item_id;
//               cartItem.dataset.price = item.price;
//               cartItem.innerHTML = `
//                 <img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}" class="cart-item-image" />
//                 <div class="cart-item-details">
//                   <h3>${item.name}</h3>
//                   <p class="item-style">Style: ${item.style || 'N/A'}</p>
//                   <p class="item-size">Size: ${item.size || 'N/A'}</p>
//                   <p class="item-price">$${item.price} x <span class="quantity" data-item-id="${item.cart_item_id}">${item.quantity}</span> = $${(item.price * item.quantity).toFixed(2)}</p>
//                   <div class="quantity-control">
//                     <button class="quantity-btn decrease" aria-label="Decrease Quantity" data-item-id="${item.cart_item_id}">
//                       <i class="fas fa-minus"></i>
//                     </button>
//                     <span class="quantity-display" data-item-id="${item.cart_item_id}">${item.quantity}</span>
//                     <button class="quantity-btn increase" aria-label="Increase Quantity" data-item-id="${item.cart_item_id}">
//                       <i class="fas fa-plus"></i>
//                     </button>
//                   </div>
//                 </div>
//                 <div class="cart-item-actions">
//                   <button class="action-btn remove-btn" data-item-id="${item.cart_item_id}" aria-label="Remove Item">
//                     <i class="fas fa-trash"></i> Remove
//                   </button>
//                 </div>
//               `;
//               cartItemsContainer.appendChild(cartItem);
//               totalPrice += item.price * item.quantity;
//             });
//             cartCount.textContent = cartItems.length;
//             summaryItemCount.textContent = cartItems.length;
//             subtotal.textContent = totalPrice.toFixed(2);
//             total.textContent = totalPrice.toFixed(2);
//           } else {
//             emptyCartMessage.textContent = 'Your cart is empty.';
//             emptyCartMessage.style.display = 'block';
//             cartCount.textContent = '0';
//             summaryItemCount.textContent = '0';
//             subtotal.textContent = '0.00';
//             total.textContent = '0.00';
//           }
//         } else {
//           emptyCartMessage.textContent = data.message || 'Failed to load cart.';
//           emptyCartMessage.style.display = 'block';
//         }
//       })
//       .catch((error) => {
//         console.error('Error loading cart:', error);
//         emptyCartMessage.textContent = 'Server error: ' + error.message;
//         emptyCartMessage.style.display = 'block';
//       });
//   }

//   loadCart();

//   cartItemsContainer.addEventListener('click', (e) => {
//     const btn = e.target.closest('.quantity-btn');
//     if (!btn) return;

//     const itemId = btn.dataset.itemId;
//     const quantityDisplay = document.querySelector(`.quantity-display[data-item-id="${itemId}"]`);
//     let quantity = parseInt(quantityDisplay.textContent);
//     const price = parseFloat(document.querySelector(`.cart-item[data-item-id="${itemId}"]`).dataset.price);

//     if (btn.classList.contains('decrease') && quantity > 1) {
//       quantity--;
//     } else if (btn.classList.contains('increase')) {
//       quantity++;
//     }

//     quantityDisplay.textContent = quantity;
//     updateItemQuantity(itemId, quantity, price);
//   });

//   cartItemsContainer.addEventListener('click', (e) => {
//     const removeBtn = e.target.closest('.remove-btn');
//     if (removeBtn) {
//       const itemId = removeBtn.dataset.itemId;
//       removeFromCart(itemId);
//     }
//   });

//   function updateItemQuantity(itemId, quantity, price) {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('Please log in to update your cart.');
//       return;
//     }

//     fetch('/api/cart/update', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ cart_item_id: itemId, quantity }),
//     })
//       .then((res) => {
//         if (!res.ok) {
//           return res.json().then((errData) => {
//             throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.message || 'Unknown error'}`);
//           });
//         }
//         return res.json();
//       })
//       .then((data) => {
//         if (data.success) {
//           const itemPriceElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .item-price`);
//           const totalPrice = price * quantity;
//           itemPriceElement.innerHTML = `$${price} x <span class="quantity" data-item-id="${itemId}">${quantity}</span> = $${totalPrice.toFixed(2)}`;
//           loadCart();
//         } else {
//           alert(data.message || 'Failed to update quantity.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error updating quantity:', error);
//         alert('Server error: ' + error.message);
//       });
//   }

//   function removeFromCart(itemId) {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('Please log in to remove items from your cart.');
//       return;
//     }

//     fetch('/api/cart/remove', {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ cart_item_id: itemId }),
//     })
//       .then((res) => {
//         if (!res.ok) {
//           return res.json().then((errData) => {
//             throw new Error(`HTTP error! Status: ${res.status}, Message: ${errData.message || 'Unknown error'}`);
//           });
//         }
//         return res.json();
//       })
//       .then((data) => {
//         if (data.success) {
//           alert('Item removed from cart!');
//           loadCart();
//         } else {
//           alert(data.message || 'Failed to remove item.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error removing from cart:', error);
//         alert('Server error: ' + error.message);
//       });
//   }
// });

document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartCount = document.getElementById('cart-count');
  const summaryItemCount = document.getElementById('summary-item-count');
  const subtotal = document.getElementById('subtotal');
  const total = document.getElementById('total');

  // Add styles for the empty cart message
  const style = document.createElement('style');
  style.textContent = `
    #cart-items {
      min-height: 200px; /* Ensure there's space for the message */
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    #empty-cart-message {
      display: none;
      background-color: #ffe6e6; /* Light red background */
      color: #1d3557; /* Dark text */
      border: 2px solid #e63946; /* Red border */
      padding: 20px 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
      font-size: 18px;
      font-family: Arial, sans-serif;
      font-weight: 500;
      max-width: 80%;
    }
  `;
  document.head.appendChild(style);

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
          cartItemsContainer.appendChild(emptyCartMessage); // Ensure the message is a child of cart-items
          if (cartItems.length > 0) {
            let totalPrice = 0;
            cartItems.forEach((item) => {
              const cartItem = document.createElement('div');
              cartItem.className = 'cart-item';
              cartItem.dataset.itemId = item.cart_item_id;
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
            cartCount.textContent = cartItems.length;
            summaryItemCount.textContent = cartItems.length;
            subtotal.textContent = totalPrice.toFixed(2);
            total.textContent = totalPrice.toFixed(2);
            emptyCartMessage.style.display = 'none';
          } else {
            emptyCartMessage.textContent = 'Your cart is empty.';
            emptyCartMessage.style.display = 'block';
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

    if (btn.classList.contains('decrease') && quantity > 1) {
      quantity--;
    } else if (btn.classList.contains('increase')) {
      quantity++;
    }

    quantityDisplay.textContent = quantity;
    updateItemQuantity(itemId, quantity, price);
  });

  cartItemsContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-btn');
    if (removeBtn) {
      const itemId = removeBtn.dataset.itemId;
      removeFromCart(itemId);
    }
  });

  function updateItemQuantity(itemId, quantity, price) {
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
      body: JSON.stringify({ cart_item_id: itemId, quantity }),
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
          const itemPriceElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .item-price`);
          const totalPrice = price * quantity;
          itemPriceElement.innerHTML = `$${price} x <span class="quantity" data-item-id="${itemId}">${quantity}</span> = $${totalPrice.toFixed(2)}`;
          loadCart();
        } else {
          alert(data.message || 'Failed to update quantity.');
        }
      })
      .catch((error) => {
        console.error('Error updating quantity:', error);
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