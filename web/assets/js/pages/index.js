document.addEventListener('DOMContentLoaded', () => {
  const products = getProducts();
  const container = document.getElementById('featuredProductsContainer');

  if (!container) return;

  const randomProducts = [...products]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  let html = '';

  randomProducts.forEach(product => {
    const isOutOfStock = product.stock <= 0;
    
    html += `
      <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <div class="relative overflow-hidden h-48">
          <img src="${product.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${product.name}">

          ${isOutOfStock ? `
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span class="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">Hết hàng</span>
            </div>
          ` : ''}
        </div>
        
        <div class="p-4">
          <h3 class="font-semibold text-lg text-gray-900 mb-1 truncate">${product.name}</h3>
          <p class="text-amber-600 font-bold mb-4">${product.price.toLocaleString('vi-VN')}₫</p>
          
          <button onclick="handleHomeAddToCart(event, ${product.id})" ${isOutOfStock ? 'disabled' : ''} class="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-semibold transition-colors ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}">
            ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
});

window.handleHomeAddToCart = function(e, productId) {
  e.stopPropagation();
  
  if (!isLoggedIn()) {
    openAuthModal();
    return;
  }

  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  if (user && user.isAdmin) {
    alert('Tài khoản Quản trị viên không thể mua hàng!');
    return;
  }
  
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  const cartKey = `cartData_${user.email}`;
  
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const existingItemIndex = cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  localStorage.setItem(cartKey, JSON.stringify(cart));
  alert('Đã thêm sản phẩm vào giỏ hàng!');
};