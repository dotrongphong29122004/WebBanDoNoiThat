document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('currentUser'));
  const cartKey = `cartData_${user.email}`; // Đọc theo từng tài khoản

  const cartItemsList = document.getElementById('cartItemsList');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const cartCountHeader = document.getElementById('cartCountHeader');
  const cartSummaryCol = document.getElementById('cartSummaryCol');

  function getCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  }

  function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
    updateHeaderCartCount();
  }

  function updateHeaderCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const headerCount = document.getElementById('cartCount');
    if (headerCount) {
      headerCount.textContent = totalItems;
      headerCount.classList.toggle('hidden', totalItems === 0);
    }
  }

  function renderCart() {
    const cart = getCart();
    
    cartCountHeader.textContent = cart.length;
    
    if (cart.length === 0) {
      cartItemsList.classList.add('hidden');
      cartSummaryCol.classList.add('hidden');
      emptyCartMessage.classList.remove('hidden');
      return;
    }

    cartItemsList.classList.remove('hidden');
    cartSummaryCol.classList.remove('hidden');
    emptyCartMessage.classList.add('hidden');

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
      subtotal += item.price * item.quantity;
      
      html += `
        <div class="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
          <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onclick="window.location.href='product-detail.html?id=${item.id}'">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          
          <div class="flex-1">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-semibold text-gray-900 cursor-pointer hover:text-amber-600 transition-colors" onclick="window.location.href='product-detail.html?id=${item.id}'">${item.name}</h3>
                <p class="text-sm text-gray-500">${item.category}</p>
              </div>
              <button onclick="removeCartItem(${index})" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
              </button>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="font-bold text-amber-600">${item.price.toLocaleString('vi-VN')}₫</span>
              
              <div class="flex items-center border border-gray-200 rounded-lg">
                <button onclick="updateQuantity(${index}, -1)" class="px-3 py-1 hover:bg-gray-100 transition-colors text-gray-600">-</button>
                <span class="px-3 py-1 font-medium text-gray-900 border-x border-gray-200">${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)" class="px-3 py-1 hover:bg-gray-100 transition-colors text-gray-600">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    cartItemsList.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const shipping = subtotal > 5000000 ? 0 : 200000;
    const total = subtotal + shipping;

    cartSubtotal.textContent = subtotal.toLocaleString('vi-VN') + '₫';
    if (shipping === 0) {
      cartShipping.innerHTML = '<span class="text-green-600 font-medium">Miễn phí</span>';
    } else {
      cartShipping.innerHTML = shipping.toLocaleString('vi-VN') + '₫';
    }
    cartTotal.textContent = total.toLocaleString('vi-VN') + '₫';
  }

  window.updateQuantity = function(index, change) {
    const cart = getCart();
    if (cart[index].quantity + change > 0) {
      cart[index].quantity += change;
      saveCart(cart);
    }
  };

  window.removeCartItem = function(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      const cart = getCart();
      cart.splice(index, 1);
      saveCart(cart);
    }
  };

  renderCart();
  setTimeout(updateHeaderCartCount, 500);
});