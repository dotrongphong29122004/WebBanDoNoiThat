document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  
  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    alert('Sản phẩm không tồn tại!');
    window.location.href = 'products.html';
    return;
  }

  document.getElementById('mainImage').src = product.image;
  document.getElementById('productCategory').textContent = product.category;
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productPrice').textContent = product.price.toLocaleString('vi-VN') + '₫';
  
  const descEl = document.getElementById('productDescription');
  if (descEl) {
    descEl.textContent = product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.';
  }
  
  if (product.originalPrice) {
    const oldPriceEl = document.getElementById('productOldPrice');
    const discountEl = document.getElementById('productDiscount');
    oldPriceEl.textContent = product.originalPrice.toLocaleString('vi-VN') + '₫';
    oldPriceEl.classList.remove('hidden');
    
    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    discountEl.textContent = `Giảm ${discountPercent}%`;
    discountEl.classList.remove('hidden');
  }

  function updateProductAverageRating() {
    const reviewArray = product.reviewList || [];
    const starContainer = document.getElementById('starContainer');
    const reviewCountEl = document.getElementById('reviewCount');
    
    let avgRating = 0;
    
    if (reviewArray.length > 0) {
      const totalStars = reviewArray.reduce((sum, rev) => sum + rev.rating, 0);
      avgRating = totalStars / reviewArray.length;
    }
    
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(avgRating)) {
        starsHtml += '<i data-lucide="star" class="w-5 h-5 fill-amber-400 text-amber-400"></i>';
      } else if (i === Math.ceil(avgRating) && !Number.isInteger(avgRating)) {
        starsHtml += '<i data-lucide="star-half" class="w-5 h-5 fill-amber-400 text-amber-400"></i>';
      } else {
        starsHtml += '<i data-lucide="star" class="w-5 h-5 text-gray-300"></i>';
      }
    }
    
    starContainer.innerHTML = starsHtml;
    reviewCountEl.textContent = `(${reviewArray.length} đánh giá)`;
  }

  updateProductAverageRating();

  const thumbContainer = document.getElementById('thumbContainer');
  for(let i=0; i<4; i++) {
      thumbContainer.innerHTML += `
        <div class="aspect-square rounded-lg overflow-hidden border-2 ${i===0 ? 'border-amber-600' : 'border-gray-200'} hover:border-amber-600 cursor-pointer transition-colors thumb-img">
          <img src="${product.image}" class="w-full h-full object-cover">
        </div>
      `;
  }

  const isOutOfStock = product.stock <= 0;
  const stockStatus = document.getElementById('stockStatus');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const buyNowBtn = document.getElementById('buyNowBtn');

  if (isOutOfStock) {
    stockStatus.innerHTML = '<span class="text-red-600 font-semibold">Hết hàng</span>';
    addToCartBtn.disabled = true;
    addToCartBtn.classList.replace('border-amber-600', 'border-gray-300');
    addToCartBtn.classList.replace('text-amber-600', 'text-gray-400');
    addToCartBtn.classList.remove('hover:bg-amber-50');
    addToCartBtn.innerHTML = '<i data-lucide="shopping-cart" class="w-5 h-5"></i> Hết hàng';
    
    buyNowBtn.disabled = true;
    buyNowBtn.classList.replace('bg-amber-600', 'bg-gray-300');
    buyNowBtn.classList.replace('hover:bg-amber-700', 'bg-gray-300');
    buyNowBtn.textContent = 'Hết hàng';
  } else {
    stockStatus.textContent = `Còn ${product.stock} sản phẩm`;
  }

  let quantity = 1;
  const maxStock = product.stock;
  const quantityDisplay = document.getElementById('quantityDisplay');
  
  document.getElementById('decreaseQtyBtn').addEventListener('click', () => {
    if (quantity > 1 && !isOutOfStock) {
      quantity--;
      quantityDisplay.textContent = quantity;
    }
  });

  document.getElementById('increaseQtyBtn').addEventListener('click', () => {
    if (quantity < maxStock && !isOutOfStock) {
      quantity++;
      quantityDisplay.textContent = quantity;
    }
  });

  addToCartBtn.addEventListener('click', () => {
    if (isOutOfStock) return;
    if (!isLoggedIn()) {
      openAuthModal();
      return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.isAdmin) {
      alert('Tài khoản Quản trị viên không thể mua hàng!');
      return;
    }
    
    const cartKey = `cartData_${user.email}`;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity: quantity });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  });

  buyNowBtn.addEventListener('click', () => {
    if (isOutOfStock) return;
    if (!isLoggedIn()) {
      openAuthModal();
      return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.isAdmin) {
      alert('Tài khoản Quản trị viên không thể mua hàng!');
      return;
    }

    window.location.href = `direct-checkout.html?id=${product.id}&qty=${quantity}`;
  });

  const colorBtns = document.querySelectorAll('.color-btn');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => {
        b.classList.remove('border-amber-600', 'bg-amber-50', 'text-amber-700');
        b.classList.add('border-gray-200');
      });
      btn.classList.remove('border-gray-200');
      btn.classList.add('border-amber-600', 'bg-amber-50', 'text-amber-700');
    });
  });

  let currentRating = 0;
  let isEditing = false;
  const ratingInputContainer = document.getElementById('ratingInputContainer');
  const reviewsList = document.getElementById('reviewsList');
  const reviewForm = document.getElementById('reviewForm');

  ratingInputContainer.innerHTML = `
    <div data-rating="1" class="cursor-pointer rating-star-input text-gray-300 transition-colors"><i data-lucide="star" class="w-8 h-8 pointer-events-none"></i></div>
    <div data-rating="2" class="cursor-pointer rating-star-input text-gray-300 transition-colors"><i data-lucide="star" class="w-8 h-8 pointer-events-none"></i></div>
    <div data-rating="3" class="cursor-pointer rating-star-input text-gray-300 transition-colors"><i data-lucide="star" class="w-8 h-8 pointer-events-none"></i></div>
    <div data-rating="4" class="cursor-pointer rating-star-input text-gray-300 transition-colors"><i data-lucide="star" class="w-8 h-8 pointer-events-none"></i></div>
    <div data-rating="5" class="cursor-pointer rating-star-input text-gray-300 transition-colors"><i data-lucide="star" class="w-8 h-8 pointer-events-none"></i></div>
  `;

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const starWrappers = document.querySelectorAll('.rating-star-input');

  function updateStars(rating) {
    starWrappers.forEach((wrapper, index) => {
      const svgIcon = wrapper.querySelector('svg');
      if (index < rating) {
        wrapper.classList.add('text-amber-400');
        wrapper.classList.remove('text-gray-300');
        if (svgIcon) svgIcon.classList.add('fill-amber-400');
      } else {
        wrapper.classList.remove('text-amber-400');
        wrapper.classList.add('text-gray-300');
        if (svgIcon) svgIcon.classList.remove('fill-amber-400');
      }
    });
  }

  starWrappers.forEach(wrapper => {
    wrapper.addEventListener('mouseenter', (e) => {
      const hoverVal = parseInt(e.currentTarget.getAttribute('data-rating'));
      updateStars(hoverVal);
    });
    
    wrapper.addEventListener('click', (e) => {
      currentRating = parseInt(e.currentTarget.getAttribute('data-rating'));
      updateStars(currentRating);
    });
  });

  ratingInputContainer.addEventListener('mouseleave', () => {
    updateStars(currentRating);
  });

  function renderReviews() {
    const reviewArray = product.reviewList || [];

    if (reviewArray.length === 0) {
      reviewsList.innerHTML = '<p class="text-gray-500 text-center py-4">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>';
    } else {
      let html = '';
      reviewArray.forEach(review => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<i data-lucide="star" class="w-4 h-4 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}"></i>`;
        }

        html += `
          <div class="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-amber-100 text-amber-600 font-bold rounded-full flex items-center justify-center">
                ${review.user.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-gray-900">${review.user}</p>
                <div class="flex items-center gap-2">
                  <div class="flex">${starsHtml}</div>
                  <span class="text-xs text-gray-500">${review.date}</span>
                </div>
              </div>
            </div>
            <p class="text-gray-600 mt-2">${review.comment}</p>
          </div>
        `;
      });
      reviewsList.innerHTML = html;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    if (isLoggedIn() && reviewForm) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const existingReview = reviewArray.find(r => r.userEmail === currentUser.email || r.user === currentUser.name);
      
      const formTitle = reviewForm.previousElementSibling;
      const submitBtn = reviewForm.querySelector('button[type="submit"]');

      if (existingReview) {
        isEditing = true;
        formTitle.textContent = 'Sửa đánh giá của bạn';
        submitBtn.textContent = 'Cập nhật đánh giá';
        
        if (currentRating === 0) {
          currentRating = existingReview.rating;
          updateStars(currentRating);
          document.getElementById('reviewComment').value = existingReview.comment;
        }
      } else {
        isEditing = false;
        formTitle.textContent = 'Viết đánh giá của bạn';
        submitBtn.textContent = 'Gửi đánh giá';
      }
    }
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!isLoggedIn()) {
        openAuthModal();
        return;
      }

      if (currentRating === 0) {
        alert('Vui lòng chọn số sao trước khi gửi đánh giá!');
        return;
      }

      const userStr = localStorage.getItem('currentUser');
      const user = JSON.parse(userStr);
      const comment = document.getElementById('reviewComment').value;

      const reviewData = {
        user: user.name,
        userEmail: user.email,
        rating: currentRating,
        comment: comment,
        date: new Date().toLocaleDateString('vi-VN')
      };

      if (!product.reviewList) {
        product.reviewList = [];
      }

      const existingReviewIndex = product.reviewList.findIndex(r => r.userEmail === user.email || r.user === user.name);

      if (existingReviewIndex > -1) {
        product.reviewList[existingReviewIndex] = reviewData;
        alert('Cập nhật đánh giá thành công!');
      } else {
        product.reviewList.unshift(reviewData);
        alert('Cảm ơn bạn đã gửi đánh giá!');
      }

      const productIndex = products.findIndex(p => p.id === product.id);
      if (productIndex !== -1) {
        products[productIndex] = product;
        saveProducts(products);
      }

      renderReviews();
      updateProductAverageRating();
    });
  }

  renderReviews();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});