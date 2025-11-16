// ============================================
// CART MANAGEMENT
// ============================================

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [
  { id: 1, name: 'Fresh Apples', price: 200, category: 'Fruits', image: 'images/apple.png' },
  { id: 2, name: 'Organic Milk', price: 80, category: 'Dairy', image: 'images/milk.jpeg' },
  { id: 3, name: 'Premium Rice', price: 600, category: 'Grains', image: 'images/rice.png' },
  { id: 4, name: 'Bananas', price: 60, category: 'Fruits', image: 'images/banana.jpeg' },
  { id: 5, name: 'Tomatoes', price: 40, category: 'Vegetables', image: 'images/tomato.jpeg' },
  { id: 6, name: 'Mustard Oil', price: 150, category: 'Oils', image: 'images/mustard.jpeg' },
  { id: 7, name: 'Refined Oil', price: 130, category: 'Oils', image: 'images/refined oil.jpeg' },
  { id: 8, name: 'ATTA', price: 50, category: 'Grains', image: 'images/wheat flour.jpeg' },
  { id: 9, name: 'Bread', price: 40, category: 'Bakery', image: 'images/bread.jpeg' },
  { id: 10, name: 'Butter', price: 50, category: 'Dairy', image: 'images/butter.jpeg' }
];

// Add to Cart Function
function addToCart(productName, price) {
  if (!isLoggedIn()) {
    alert('Please login first to add items to cart!');
    window.location.href = 'login.html';
    return;
  }

  const product = { name: productName, price: price, qty: 1, id: Date.now() };
  const existingProduct = cart.find(item => item.name === productName);

  if (existingProduct) {
    existingProduct.qty++;
    alert(`${productName} quantity increased!`);
  } else {
    cart.push(product);
    alert(`${productName} added to cart!`);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Update Cart Count in Navbar
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(el => {
    el.textContent = cart.length;
  });
}

// Display Cart Items
function displayCart() {
  const cartTable = document.querySelector('.cart-table tbody');
  if (!cartTable) return;

  if (cart.length === 0) {
    cartTable.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Your cart is empty!</td></tr>';
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) totalElement.textContent = 'Grand Total: ₹ 0';
    return;
  }

  cartTable.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const row = `
      <tr>
        <td>${item.name}</td>
        <td><input type="number" value="${item.qty}" min="1" onchange="updateQty(${index}, this.value)"></td>
        <td>₹ ${item.price}</td>
        <td>₹ ${item.price * item.qty}</td>
        <td><button onclick="removeFromCart(${index})" style="background:red;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;"><i class="fas fa-trash"></i> Remove</button></td>
      </tr>
    `;
    cartTable.innerHTML += row;
    total += item.price * item.qty;
  });

  const totalElement = document.querySelector('.cart-total');
  if (totalElement) {
    totalElement.textContent = `Grand Total: ₹ ${total}`;
  }
}

// Update Quantity
function updateQty(index, newQty) {
  if (newQty <= 0) {
    removeFromCart(index);
    return;
  }
  cart[index].qty = parseInt(newQty);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

// Remove from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
  updateCartCount();
  alert('Item removed from cart!');
}

// Clear Cart
function clearCart() {
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ============================================
// USER AUTHENTICATION
// ============================================

// Login Function
function login(username, password) {
  if (!username || !password) {
    alert('Please fill all fields!');
    return;
  }

  // Check if user exists
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('Login successful!');
    window.location.href = 'index.html';
  } else {
    alert('Invalid username or password!');
  }
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  alert('Logged out successfully!');
  window.location.href = 'index.html';
}

// Signup Function
function signup(name, email, username, password, confirmPassword) {
  if (!name || !email || !username || !password || !confirmPassword) {
    alert('Please fill all fields!');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // Check if username already exists
  if (users.find(u => u.username === username)) {
    alert('Username already exists!');
    return;
  }

  const newUser = { id: Date.now(), name, email, username, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful! Please login.');
  window.location.href = 'login.html';
}

// ============================================
// ORDER MANAGEMENT
// ============================================

// Place Order
function placeOrder(fullName, address, phone, paymentMethod) {
  if (!isLoggedIn()) {
    alert('Please login to place an order.');
    window.location.href = 'login.html';
    return;
  }

  const currentUser = getCurrentUser();
  const order = {
    orderId: '#' + Math.floor(Math.random() * 100000),
    customer: fullName,
    customerId: currentUser.id,
    address: address,
    phone: phone,
    paymentMethod: paymentMethod,
    items: cart,
    totalAmount: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
    date: new Date().toLocaleDateString(),
    status: 'Pending',
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
  };

  // Save order to localStorage
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));

  alert(`Order placed successfully!\n\nOrder ID: ${order.orderId}\nDelivery Date: ${order.deliveryDate}`);
  window.location.href = 'index.html';
}

// Display Orders (Customer)
function displayMyOrders() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const ordersContainer = document.querySelector('.orders-container');
  if (!ordersContainer) return;

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  const myOrders = orders.filter(o => o.customerId === currentUser.id);

  if (myOrders.length === 0) {
    ordersContainer.innerHTML = '<p style="text-align:center;">No orders found!</p>';
    return;
  }

  let html = '';
  myOrders.forEach(order => {
    html += `
      <div style="background:#fff;padding:15px;margin:10px 0;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        <h3>${order.orderId}</h3>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Status:</strong> <span style="background:#fff3e0;color:#ff9800;padding:4px 8px;border-radius:4px;">${order.status}</span></p>
        <p><strong>Total:</strong> ₹ ${order.totalAmount}</p>
        <p><strong>Delivery:</strong> ${order.deliveryDate}</p>
      </div>
    `;
  });

  ordersContainer.innerHTML = html;
}

// Display All Orders (Admin)
function displayAdminOrders() {
  const ordersTable = document.querySelector('.orders-table tbody');
  if (!ordersTable) return;

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  ordersTable.innerHTML = '';

  if (orders.length === 0) {
    ordersTable.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No orders found!</td></tr>';
    return;
  }

  orders.forEach(order => {
    const row = `
      <tr>
        <td>${order.orderId}</td>
        <td>${order.customer}</td>
        <td>${order.items[0]?.name || 'N/A'}</td>
        <td>${order.items.length}</td>
        <td>₹ ${order.totalAmount}</td>
        <td><span style="background:#fff3e0;color:#ff9800;padding:4px 8px;border-radius:4px;">${order.status}</span></td>
        <td>
          <a href="#" onclick="viewAdminOrder('${order.orderId}')" style="color:#4caf50;text-decoration:none;margin-right:10px;font-weight:500;">View</a>
          <a href="#" onclick="updateOrderStatus('${order.orderId}')" style="color:#ff9800;text-decoration:none;font-weight:500;">Update</a>
        </td>
      </tr>
    `;
    ordersTable.innerHTML += row;
  });
}

// View Order Details (Admin)
function viewAdminOrder(orderId) {
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.orderId === orderId);
  
  if (order) {
    alert(`Order ID: ${order.orderId}\nCustomer: ${order.customer}\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}\nDelivery: ${order.deliveryDate}`);
  }
}

// Update Order Status
function updateOrderStatus(orderId) {
  const newStatus = prompt('Enter new status (Pending/Processing/Delivered):', 'Pending');
  if (!newStatus) return;

  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.orderId === orderId);
  
  if (order) {
    order.status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    alert('Order status updated!');
    displayAdminOrders();
  }
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// Admin Login
function adminLogin(username, password) {
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('adminLogged', 'true');
    alert('Admin login successful!');
    window.location.href = 'admin-dashboard.html';
  } else {
    alert('Invalid admin credentials!');
  }
}

// Check if admin is logged in
function isAdminLoggedIn() {
  if (!localStorage.getItem('adminLogged')) {
    window.location.href = 'admin-login.html';
  }
}

// Admin Logout
function adminLogout() {
  localStorage.removeItem('adminLogged');
  alert('Admin logged out!');
  window.location.href = 'admin-login.html';
}

// ============================================
// PRODUCT MANAGEMENT (ADMIN)
// ============================================

// Display All Products (Admin)
function displayAdminProducts() {
  const productsTable = document.querySelector('.products-table tbody');
  if (!productsTable) return;

  productsTable.innerHTML = '';

  products.forEach(product => {
    const row = `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>₹ ${product.price}</td>
        <td><img src="${product.image}" alt="${product.name}" style="width:40px;height:40px;border-radius:8px;"></td>
        <td class="product-action">
          <a href="#" onclick="editProduct(${product.id})" style="color:#4caf50;text-decoration:none;margin-right:10px;font-weight:500;"><i class="fas fa-edit"></i> Edit</a>
          <a href="#" onclick="deleteProduct(${product.id})" style="color:#e53935;text-decoration:none;font-weight:500;"><i class="fas fa-trash"></i> Delete</a>
        </td>
      </tr>
    `;
    productsTable.innerHTML += row;
  });
}

// Add New Product (Admin)
function addAdminProduct(name, description, category, price, image) {
  if (!name || !price || !category) {
    alert('Please fill required fields!');
    return;
  }

  const newProduct = {
    id: Date.now(),
    name: name,
    description: description,
    category: category,
    price: parseInt(price),
    image: image || 'images/default.png'
  };

  products.push(newProduct);
  localStorage.setItem('products', JSON.stringify(products));
  alert('Product added successfully!');
  window.location.href = 'admin-products.html';
}

// Edit Product (Admin)
function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    alert('Product not found!');
    return;
  }

  const newPrice = prompt('Enter new price:', product.price);
  if (newPrice) {
    product.price = parseInt(newPrice);
    localStorage.setItem('products', JSON.stringify(products));
    alert('Product updated!');
    displayAdminProducts();
  }
}

// Delete Product (Admin)
function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    alert('Product deleted!');
    displayAdminProducts();
  }
}

// ============================================
// USER MANAGEMENT (ADMIN)
// ============================================

// Display All Users (Admin)
function displayAdminUsers() {
  const usersTable = document.querySelector('.users-table tbody');
  if (!usersTable) return;

  usersTable.innerHTML = '';

  if (users.length === 0) {
    usersTable.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No users found!</td></tr>';
    return;
  }

  users.forEach((user, index) => {
    const row = `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span style="background:#fff3e0;color:#ff9800;padding:4px 8px;border-radius:4px;">Customer</span></td>
        <td class="user-action">
          <a href="#" onclick="viewUserDetails(${index})" style="color:#4caf50;text-decoration:none;margin-right:10px;font-weight:500;"><i class="fas fa-eye"></i> View</a>
          <a href="#" onclick="deleteUser(${index})" style="color:#e53935;text-decoration:none;font-weight:500;"><i class="fas fa-trash"></i> Delete</a>
        </td>
      </tr>
    `;
    usersTable.innerHTML += row;
  });
}

// View User Details (Admin)
function viewUserDetails(index) {
  const user = users[index];
  alert(`User ID: ${user.id}\nName: ${user.name}\nEmail: ${user.email}\nUsername: ${user.username}`);
}

// Delete User (Admin)
function deleteUser(index) {
  if (confirm('Are you sure you want to delete this user?')) {
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
    alert('User deleted!');
    displayAdminUsers();
  }
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();

  // Update navbar based on login status
  updateNavbar();

  // Initialize pages based on current URL
  const path = window.location.pathname;

  if (path.includes('cart.html')) {
    displayCart();
  }

  if (path.includes('admin-orders.html')) {
    isAdminLoggedIn();
    displayAdminOrders();
  }

  if (path.includes('admin-products.html')) {
    isAdminLoggedIn();
    displayAdminProducts();
  }

  if (path.includes('admin-users.html')) {
    isAdminLoggedIn();
    displayAdminUsers();
  }

  if (path.includes('user-details.html')) {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
});

function toggleRequiresLogin() {
  const elems = document.querySelectorAll('.requires-login');
  const allowed = isLoggedIn();
  elems.forEach(el => {
    if (allowed) el.style.display = '';    // show (use default CSS)
    else el.style.display = 'none';        // hide when not logged in
  });
}

// Update Navbar
function updateNavbar() {
  const user = getCurrentUser();
  const userNav = document.querySelector('.user-nav');

  if (userNav) {
    if (user) {
      userNav.innerHTML = `<span style="color:#4caf50;font-weight:600;">${user.name}</span> <a href="#" onclick="logout()" style="margin-left:8px;color:#e53935;text-decoration:none;">Logout</a>`;
    } else {
      userNav.innerHTML = `<a href="login.html">Login</a> <a href="signup.html" style="margin-left:8px;">Signup</a>`;
    }
  }

  // toggle elements that require login (Order buttons, Checkout links, etc.)
  toggleRequiresLogin();
}

// ensure placeOrder requires login
const originalPlaceOrder = typeof placeOrder === 'function' ? placeOrder : null;
function placeOrder(fullName, address, phone, paymentMethod) {
  if (!isLoggedIn()) {
    alert('Please login to place an order.');
    window.location.href = 'login.html';
    return;
  }

  // if originalPlaceOrder exists (older code), call it; else implement basic flow
  if (originalPlaceOrder) {
    // call the original implementation
    originalPlaceOrder(fullName, address, phone, paymentMethod);
    return;
  }

  // fallback simple implementation
  if (!fullName || !address || !phone || !paymentMethod) {
    alert('Please fill all fields!');
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const user = getCurrentUser();
  const order = {
    orderId: '#' + Math.floor(Math.random() * 100000),
    customer: user ? user.name : fullName,
    customerId: user ? user.id : null,
    address, phone, paymentMethod,
    items: cart,
    totalAmount: cart.reduce((s,i)=> s + (i.price * i.qty), 0),
    date: new Date().toLocaleDateString(),
    status: 'Pending',
    deliveryDate: new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()
  };

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.removeItem('cart');
  alert(`Order placed: ${order.orderId}\nDelivery: ${order.deliveryDate}`);
  window.location.href = 'index.html';
}