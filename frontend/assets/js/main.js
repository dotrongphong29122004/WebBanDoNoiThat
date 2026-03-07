let isLoginMode = true;
let isPasswordVisible = false;

// Các hàm dùng chung (Global Functions)
window.isLoggedIn = function() {
  return localStorage.getItem('currentUser') !== null;
};

window.openAuthModal = function() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
  }
};

window.closeAuthModal = function() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
  }
};

window.handleLogout = function() {
  localStorage.removeItem('currentUser');
  window.location.reload();
};

// Hàm chính: Tải Header và khởi tạo các sự kiện
async function loadHeader() {
  try {
    const response = await fetch('components/header.html');
    const html = await response.text();
    document.getElementById('header-placeholder').innerHTML = html;
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    checkAuthStatus();
    initHeaderEvents(); // Gọi hàm khởi tạo sự kiện SAU KHI HTML đã tải xong
    
  } catch (error) {
    console.error(error);
  }
}

// Cập nhật giao diện dựa trên trạng thái Đăng nhập
function checkAuthStatus() {
  const userStr = localStorage.getItem('currentUser');
  const loggedOutState = document.getElementById('loggedOutState');
  const loggedInState = document.getElementById('loggedInState');
  const headerUserName = document.getElementById('headerUserName');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');
  const adminBadge = document.getElementById('adminBadge');
  const userOrdersBtn = document.getElementById('userOrdersBtn');
  const adminProductsBtn = document.getElementById('adminProductsBtn');
  const adminOrdersBtn = document.getElementById('adminOrdersBtn');
  const cartBtn = document.getElementById('cartBtn');

  if (userStr) {
    const user = JSON.parse(userStr);
    
    if (loggedOutState) loggedOutState.classList.add('hidden');
    if (loggedInState) {
      loggedInState.classList.remove('hidden');
      loggedInState.classList.add('flex');
    }
    
    if (headerUserName) headerUserName.textContent = user.name;
    if (dropdownUserName) dropdownUserName.textContent = user.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;

    if (user.isAdmin) {
      if (adminBadge) adminBadge.classList.remove('hidden');
      if (userOrdersBtn) userOrdersBtn.classList.add('hidden');
      if (adminProductsBtn) { adminProductsBtn.classList.remove('hidden'); adminProductsBtn.classList.add('flex'); }
      if (adminOrdersBtn) { adminOrdersBtn.classList.remove('hidden'); adminOrdersBtn.classList.add('flex'); }
      if (cartBtn) cartBtn.classList.add('hidden');
    } else {
      if (adminBadge) adminBadge.classList.add('hidden');
      if (userOrdersBtn) { userOrdersBtn.classList.remove('hidden'); userOrdersBtn.classList.add('flex'); }
      if (adminProductsBtn) adminProductsBtn.classList.add('hidden');
      if (adminOrdersBtn) adminOrdersBtn.classList.add('hidden');
      if (cartBtn) cartBtn.classList.remove('hidden');
    }
  } else {
    if (loggedOutState) {
      loggedOutState.classList.remove('hidden');
      loggedOutState.classList.add('flex');
    }
    if (loggedInState) loggedInState.classList.add('hidden');
    if (cartBtn) cartBtn.classList.remove('hidden');
  }
}

// Khởi tạo toàn bộ sự kiện cho Header và Auth Modal
function initHeaderEvents() {
  // 1. Sự kiện Menu Dropdown của User
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenuDropdown = document.getElementById('userMenuDropdown');

  if (userMenuBtn && userMenuDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
        userMenuDropdown.classList.add('hidden');
      }
    });
  }

  // 2. Sự kiện cho nút Giỏ Hàng trên Header
  const headerCartBtn = document.getElementById('cartBtn');
  if (headerCartBtn) {
    headerCartBtn.removeAttribute('onclick'); // Xóa onclick cũ trong HTML
    headerCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isLoggedIn()) {
        openAuthModal();
      } else {
        window.location.href = 'cart.html';
      }
    });
  }

  // 3. Sự kiện cho Auth Modal (Form Đăng Nhập/Đăng Ký)
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const authForm = document.getElementById('authForm');

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
  }

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      isPasswordVisible = !isPasswordVisible;
      const passwordInput = document.getElementById('passwordInput');
      const passwordEyeIcon = document.getElementById('passwordEyeIcon');
      passwordInput.type = isPasswordVisible ? 'text' : 'password';
      passwordEyeIcon.setAttribute('data-lucide', isPasswordVisible ? 'eye-off' : 'eye');
      lucide.createIcons();
    });
  }

  if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
      isLoginMode = !isLoginMode;
      const errorMessage = document.getElementById('errorMessage');
      const nameField = document.getElementById('nameField');
      const confirmPasswordField = document.getElementById('confirmPasswordField');
      const authTitle = document.getElementById('authTitle');
      const authSubtitle = document.getElementById('authSubtitle');
      const submitAuthBtn = document.getElementById('submitAuthBtn');
      const toggleAuthText = document.getElementById('toggleAuthText');
      
      errorMessage.classList.add('hidden');
      authForm.reset();

      if (isLoginMode) {
        authTitle.textContent = 'Đăng Nhập';
        authSubtitle.textContent = 'Chào mừng bạn trở lại!';
        nameField.classList.add('hidden');
        nameField.querySelector('input').removeAttribute('required');
        confirmPasswordField.classList.add('hidden');
        confirmPasswordField.querySelector('input').removeAttribute('required');
        submitAuthBtn.textContent = 'Đăng nhập';
        toggleAuthText.textContent = 'Chưa có tài khoản?';
        toggleAuthModeBtn.textContent = 'Đăng ký ngay';
      } else {
        authTitle.textContent = 'Đăng Ký';
        authSubtitle.textContent = 'Tạo tài khoản mới';
        nameField.classList.remove('hidden');
        nameField.querySelector('input').setAttribute('required', 'true');
        confirmPasswordField.classList.remove('hidden');
        confirmPasswordField.querySelector('input').setAttribute('required', 'true');
        submitAuthBtn.textContent = 'Đăng ký';
        toggleAuthText.textContent = 'Đã có tài khoản?';
        toggleAuthModeBtn.textContent = 'Đăng nhập';
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.classList.add('hidden');

      const emailVal = document.getElementById('emailInput').value;
      const pwdVal = document.getElementById('passwordInput').value;
      
      let usersList = JSON.parse(localStorage.getItem('usersList')) || [];
      let userName = "";
      let isAdminAcc = false;

      if (!isLoginMode) {
        const confirmPwd = document.getElementById('confirmPasswordInput').value;
        userName = document.getElementById('nameInput').value;

        if (pwdVal.length < 6) {
          errorMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
          errorMessage.classList.remove('hidden');
          return;
        }
        if (pwdVal !== confirmPwd) {
          errorMessage.textContent = 'Mật khẩu xác nhận không khớp';
          errorMessage.classList.remove('hidden');
          return;
        }
        
        const existingUser = usersList.find(u => u.email === emailVal);
        if (existingUser) {
          errorMessage.textContent = 'Email này đã được đăng ký!';
          errorMessage.classList.remove('hidden');
          return;
        }

        isAdminAcc = (emailVal === 'admin@gmail.com');
        usersList.push({
          name: userName,
          email: emailVal,
          password: pwdVal,
          isAdmin: isAdminAcc
        });
        localStorage.setItem('usersList', JSON.stringify(usersList));
        
        alert('Đăng ký thành công!');
      } else {
        if (emailVal === 'admin@gmail.com' && pwdVal === 'admin1') {
           userName = 'Quản Trị Viên';
           isAdminAcc = true;
           if (!usersList.find(u => u.email === 'admin@gmail.com')) {
             usersList.push({ name: userName, email: emailVal, password: pwdVal, isAdmin: true });
             localStorage.setItem('usersList', JSON.stringify(usersList));
           }
        } else {
           const foundUser = usersList.find(u => u.email === emailVal);
           if (!foundUser) {
             errorMessage.textContent = 'Tài khoản không tồn tại!';
             errorMessage.classList.remove('hidden');
             return;
           }
           if (foundUser.password !== pwdVal) {
             errorMessage.textContent = 'Sai mật khẩu!';
             errorMessage.classList.remove('hidden');
             return;
           }
           
           userName = foundUser.name;
           isAdminAcc = foundUser.isAdmin || false;
        }
      }

      localStorage.setItem('currentUser', JSON.stringify({ 
        name: userName, 
        email: emailVal,
        isAdmin: isAdminAcc 
      }));
      
      closeAuthModal();
      checkAuthStatus();
    });
  }
}

// Kích hoạt load Header khi trang web bắt đầu chạy
document.addEventListener('DOMContentLoaded', loadHeader);