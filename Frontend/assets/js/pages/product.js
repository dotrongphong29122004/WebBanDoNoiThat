let products = getProducts();

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryInputs = document.querySelectorAll('input[name="category"]');
const priceInputs = document.querySelectorAll('input[name="price"]');
const productsContainer = document.getElementById('productsContainer');
const productCount = document.getElementById('productCount');
const noProductsMessage = document.getElementById('noProductsMessage');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const clearFiltersEmptyBtn = document.getElementById('clearFiltersEmptyBtn');
const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
const filtersSidebar = document.getElementById('filtersSidebar');

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function renderProducts(filteredList) {
  if (!productsContainer) return;
  productsContainer.innerHTML = '';
  
  if (productCount) {
    productCount.textContent = filteredList.length;
  }

  if (filteredList.length === 0) {
    productsContainer.classList.add('hidden');
    if (noProductsMessage) noProductsMessage.classList.remove('hidden');
    return;
  }

  productsContainer.classList.remove('hidden');
  if (noProductsMessage) noProductsMessage.classList.add('hidden');

  filteredList.forEach(product => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer';
    card.innerHTML = `
      <div class="relative overflow-hidden" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300">
        
        ${product.stock <= 0 ? `
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span class="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">Hết hàng</span>
          </div>
        ` : ''}

        ${product.stock > 0 && product.originalPrice ? `
          <div class="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            -${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        ` : ''}

        ${product.stock > 0 ? `
          <button class="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
            <i data-lucide="heart" class="w-4 h-4 text-gray-600"></i>
          </button>
        ` : ''}
      </div>
      
      <div class="p-4">
        <p class="text-sm text-gray-500 mb-1">${product.category}</p>
        <h3 class="font-semibold text-gray-900 mb-2 hover:text-amber-600 transition-colors" onclick="window.location.href='product-detail.html?id=${product.id}'">
          ${product.name}
        </h3>
        
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl font-bold text-amber-600">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="text-sm text-gray-400 line-through">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>

        <p class="text-sm text-gray-500 mb-3">
          ${product.stock <= 0 ? '<span class="text-red-600 font-semibold">Hết hàng</span>' : `<span>Còn ${product.stock} sản phẩm</span>`}
        </p>

        <div class="flex gap-2">
          <button ${product.stock <= 0 ? 'disabled' : ''} onclick="handleProductAction(event, 'cart', ${product.id})" class="flex-1 border-2 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${product.stock <= 0 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-amber-600 text-amber-600 hover:bg-amber-50'}">
            <i data-lucide="shopping-cart" class="w-4 h-4"></i>
            Thêm
          </button>
          <button ${product.stock <= 0 ? 'disabled' : ''} onclick="handleProductAction(event, 'buy', ${product.id})" class="flex-1 py-2 rounded-lg font-semibold transition-colors ${product.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white'}">
            Mua ngay
          </button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function filterAndSortProducts() {
  let searchTerm = '';
  if (searchInput) searchTerm = searchInput.value.toLowerCase();
  
  const checkedCategory = document.querySelector('input[name="category"]:checked');
  const selectedCategory = checkedCategory ? checkedCategory.value : 'all';
  
  const checkedPrice = document.querySelector('input[name="price"]:checked');
  const selectedPrice = checkedPrice ? checkedPrice.value : 'all';
  
  const sortBy = sortSelect ? sortSelect.value : 'default';

  let result = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (selectedPrice === 'under5') matchesPrice = product.price < 5000000;
    else if (selectedPrice === '5to10') matchesPrice = product.price >= 5000000 && product.price < 10000000;
    else if (selectedPrice === '10to15') matchesPrice = product.price >= 10000000 && product.price < 15000000;
    else if (selectedPrice === 'over15') matchesPrice = product.price >= 15000000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (sortBy === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderProducts(result);
}

function clearFilters() {
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'default';
  
  const allCategory = document.querySelector('input[name="category"][value="all"]');
  if (allCategory) allCategory.checked = true;
  
  const allPrice = document.querySelector('input[name="price"][value="all"]');
  if (allPrice) allPrice.checked = true;
  
  filterAndSortProducts();
}

if (searchInput) searchInput.addEventListener('input', filterAndSortProducts);
if (sortSelect) sortSelect.addEventListener('change', filterAndSortProducts);
if (categoryInputs) categoryInputs.forEach(input => input.addEventListener('change', filterAndSortProducts));
if (priceInputs) priceInputs.forEach(input => input.addEventListener('change', filterAndSortProducts));

if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
if (clearFiltersEmptyBtn) clearFiltersEmptyBtn.addEventListener('click', clearFilters);

if (toggleFiltersBtn) {
  toggleFiltersBtn.addEventListener('click', () => {
    if (filtersSidebar) filtersSidebar.classList.toggle('hidden');
  });
}

window.handleProductAction = function(e, action, productId) {
  e.stopPropagation();
  if (!isLoggedIn()) {
    openAuthModal();
    return;
  }

  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  if (user && user.isAdmin) {
    alert('Tài khoản Quản trị viên không thể thực hiện chức năng này!');
    return;
  }
  
  const product = products.find(p => p.id === productId);

  if (action === 'cart') {
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
  } else if (action === 'buy') {
    window.location.href = `direct-checkout.html?id=${productId}&qty=1`;
  }
};

renderProducts(products);