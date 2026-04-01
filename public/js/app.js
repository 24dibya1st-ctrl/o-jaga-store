/* ════════════════════════════════════════════════════════
   O JAGA — Art & Craft Store
   Application Logic
   ════════════════════════════════════════════════════════ */

const API = '/api';

// ─── State ───
let currentPage = 'home';
let currentCategory = 'All';
let currentSort = '';
let searchQuery = '';
let allProducts = [];
let cartData = { items: [], itemCount: 0, subtotal: 0, shipping: 0, total: 0 };

// ─── Category Icons ───
const categoryIcons = {
  'Painting & Drawing': '🎨',
  'Pottery & Ceramics': '🏺',
  'Textile & Fiber': '🧶',
  'Paper Crafts': '📄',
  'Home Décor': '🏠',
  'Craft Supplies': '🖌️',
  'Pattachitra': '🙏'
};

// ═══════════════ API FUNCTIONS ═══════════════

async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.sort) query.set('sort', params.sort);

  try {
    const res = await fetch(`${API}/products?${query}`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API}/products/categories`);
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

async function fetchCart() {
  try {
    const res = await fetch(`${API}/cart`);
    const data = await res.json();
    cartData = data;
    updateCartBadge();
    return data;
  } catch (err) {
    console.error('Failed to fetch cart:', err);
    return cartData;
  }
}

async function addToCart(productId) {
  try {
    const res = await fetch(`${API}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ ${data.message}`);
      await fetchCart();
      renderCartItems();
    }
  } catch (err) {
    showToast('Failed to add item', 'error');
  }
}

async function updateCartQty(productId, quantity) {
  try {
    await fetch(`${API}/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    await fetchCart();
    renderCartItems();
    if (currentPage === 'checkout') renderCheckoutSummary();
  } catch (err) {
    showToast('Failed to update cart', 'error');
  }
}

async function removeFromCart(productId) {
  try {
    await fetch(`${API}/cart/${productId}`, { method: 'DELETE' });
    await fetchCart();
    renderCartItems();
    if (currentPage === 'checkout') renderCheckoutSummary();
    showToast('✓ Item removed');
  } catch (err) {
    showToast('Failed to remove item', 'error');
  }
}

async function submitOrder(orderData) {
  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Failed to place order' };
  }
}

// ═══════════════ NAVIGATION ═══════════════

function navigateTo(page) {
  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Activate target page
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update nav link
  const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (navLink) navLink.classList.add('active');

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Load page-specific content
  if (page === 'shop') loadShopPage();
  if (page === 'checkout') loadCheckoutPage();
}

// ═══════════════ HOME PAGE ═══════════════

async function loadHomePage() {
  // Load categories
  const categories = await fetchCategories();
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = categories
    .filter(c => c !== 'All')
    .map(cat => `
      <div class="category-card" onclick="navigateTo('shop'); filterByCategory('${cat}')" style="background: var(--bg-card);">
        <span class="category-emoji">${categoryIcons[cat] || '🎯'}</span>
        <span class="category-name">${cat}</span>
      </div>
    `).join('');

  // Load featured products (top rated)
  allProducts = await fetchProducts();
  const featured = [...allProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);
  renderProductGrid('featured-products', featured);
}

// ═══════════════ SHOP PAGE ═══════════════

async function loadShopPage() {
  // Load category filters
  const categories = await fetchCategories();
  const filterContainer = document.getElementById('category-filters');
  filterContainer.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === currentCategory ? 'active' : ''}" 
            onclick="filterByCategory('${cat}')">
      ${cat === 'All' ? '🏷️' : (categoryIcons[cat] || '')} ${cat}
    </button>
  `).join('');

  // Load products
  await loadShopProducts();
}

async function loadShopProducts() {
  const products = await fetchProducts({
    category: currentCategory,
    search: searchQuery,
    sort: currentSort
  });
  renderProductGrid('shop-products', products);
  document.getElementById('results-count').textContent =
    `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;
}

function filterByCategory(category) {
  currentCategory = category;
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().includes(category));
  });
  loadShopProducts();
}

function handleSort(value) {
  currentSort = value;
  loadShopProducts();
}

function handleSearch(value) {
  searchQuery = value;
  if (currentPage === 'shop') {
    loadShopProducts();
  } else if (value.length > 0) {
    navigateTo('shop');
  }
}

// ═══════════════ PRODUCT RENDERING ═══════════════

function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products.map(product => `
    <div class="product-card" onclick="openProductModal('${product.id}')">
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      <div class="product-card-image" style="background: ${product.gradient}">
        ${product.image}
      </div>
      <div class="product-card-body">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <div>
            <div class="product-price">
              <span class="currency">₹</span>${product.price.toLocaleString('en-IN')}
            </div>
            <div class="product-rating">
              ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
              <span>(${product.reviews})</span>
            </div>
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')" title="Add to cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        <a href="https://wa.me/918093319103?text=Hi! I'm interested in ${encodeURIComponent(product.name)} (₹${product.price.toLocaleString('en-IN')})" 
           class="btn-whatsapp" target="_blank" rel="noopener" onclick="event.stopPropagation()">
          💬 Request Details
        </a>
      </div>
    </div>
  `).join('');
}

// ═══════════════ PRODUCT MODAL ═══════════════

function openProductModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div class="modal-image" style="background: ${product.gradient}">
      <button class="modal-close" onclick="closeModal(event)">✕</button>
      ${product.image}
    </div>
    <div class="modal-body">
      <div class="modal-category">${product.category}</div>
      <h2 class="modal-name">${product.name}</h2>
      <div class="modal-rating">
        <span class="modal-stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
        ${product.rating}
        <span class="modal-review-count">(${product.reviews} reviews)</span>
      </div>
      <p class="modal-description">${product.description}</p>
      <div class="modal-price-row">
        <div class="modal-price">
          <span class="currency">₹</span>${product.price.toLocaleString('en-IN')}
        </div>
        <button class="btn btn-primary modal-add-btn" onclick="addToCart('${product.id}'); closeModal(event)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Add to Cart
        </button>
      </div>
      <a href="https://wa.me/918093319103?text=Hi! I'm interested in ${encodeURIComponent(product.name)} (₹${product.price.toLocaleString('en-IN')}). Can you share more details?" 
         class="btn-whatsapp" target="_blank" rel="noopener" style="margin-top:12px; width:100%; justify-content:center; padding:12px 20px; font-size:0.9rem;">
        💬 Request Details via WhatsApp
      </a>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (event.target.id === 'product-modal' || event.target.closest('.modal-close')) {
    document.getElementById('product-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ═══════════════ CART DRAWER ═══════════════

function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const isOpen = drawer.classList.contains('open');

  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = isOpen ? '' : 'hidden';

  if (!isOpen) {
    fetchCart().then(() => renderCartItems());
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  const count = cartData.itemCount || 0;
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
}

function renderCartItems() {
  const itemsContainer = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');
  const totals = document.getElementById('cart-totals');

  if (!cartData.items || cartData.items.length === 0) {
    emptyState.style.display = 'block';
    itemsContainer.innerHTML = '';
    footer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  footer.style.display = 'block';

  itemsContainer.innerHTML = cartData.items.map(item => {
    if (!item.product) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-image" style="background: ${item.product.gradient}">
          ${item.product.image}
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.product.name}</div>
          <div class="cart-item-price">₹${item.product.price.toLocaleString('en-IN')}</div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-item-remove" onclick="removeFromCart('${item.productId}')">Remove</button>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateCartQty('${item.productId}', ${item.quantity - 1})">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.productId}', ${item.quantity + 1})">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  totals.innerHTML = `
    <div class="cart-total-row">
      <span>Subtotal</span>
      <span>₹${cartData.subtotal.toLocaleString('en-IN')}</span>
    </div>
    <div class="cart-total-row">
      <span>Shipping</span>
      <span>${cartData.shipping === 0 ? '<span class="free-shipping-tag">FREE</span>' : '₹' + cartData.shipping}</span>
    </div>
    <div class="cart-total-row total">
      <span>Total</span>
      <span>₹${cartData.total.toLocaleString('en-IN')}</span>
    </div>
  `;
}

// ═══════════════ SEARCH ═══════════════

function toggleSearch() {
  const bar = document.getElementById('search-bar');
  const input = document.getElementById('search-input');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) {
    setTimeout(() => input.focus(), 300);
  } else {
    input.value = '';
    searchQuery = '';
    if (currentPage === 'shop') loadShopProducts();
  }
}

// ═══════════════ CHECKOUT ═══════════════

async function loadCheckoutPage() {
  await fetchCart();

  if (!cartData.items || cartData.items.length === 0) {
    navigateTo('shop');
    showToast('Your cart is empty. Add items first!');
    return;
  }

  renderCheckoutSummary();

  // Payment option toggle
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('change', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function renderCheckoutSummary() {
  const itemsContainer = document.getElementById('checkout-items');
  const totalsContainer = document.getElementById('checkout-totals');

  if (!cartData.items) return;

  itemsContainer.innerHTML = cartData.items.map(item => {
    if (!item.product) return '';
    return `
      <div class="checkout-item">
        <div class="checkout-item-img" style="background: ${item.product.gradient}">
          ${item.product.image}
        </div>
        <div class="checkout-item-info">
          <div class="checkout-item-name">${item.product.name}</div>
          <div class="checkout-item-meta">Qty: ${item.quantity}</div>
        </div>
        <div class="checkout-item-price">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</div>
      </div>
    `;
  }).join('');

  totalsContainer.innerHTML = `
    <div class="cart-total-row" style="margin-top:16px">
      <span>Subtotal</span>
      <span>₹${cartData.subtotal.toLocaleString('en-IN')}</span>
    </div>
    <div class="cart-total-row">
      <span>Shipping</span>
      <span>${cartData.shipping === 0 ? '<span class="free-shipping-tag">FREE</span>' : '₹' + cartData.shipping}</span>
    </div>
    <div class="cart-total-row total">
      <span>Total</span>
      <span>₹${cartData.total.toLocaleString('en-IN')}</span>
    </div>
  `;
}

async function placeOrder(event) {
  event.preventDefault();

  const form = document.getElementById('checkout-form');
  const btn = document.getElementById('place-order-btn');

  const orderData = {
    name: form.querySelector('#cust-name').value,
    email: form.querySelector('#cust-email').value,
    phone: form.querySelector('#cust-phone').value,
    address: form.querySelector('#cust-address').value,
    city: form.querySelector('#cust-city').value,
    pincode: form.querySelector('#cust-pincode').value,
    paymentMethod: form.querySelector('input[name="paymentMethod"]:checked').value
  };

  btn.textContent = 'Placing Order...';
  btn.disabled = true;

  const result = await submitOrder(orderData);

  if (result.success) {
    showOrderConfirmation(result.order);
    await fetchCart();
    form.reset();
  } else {
    showToast(result.message || 'Failed to place order', 'error');
  }

  btn.textContent = 'Place Order';
  btn.disabled = false;
}

function showOrderConfirmation(order) {
  const container = document.getElementById('confirmation-content');

  container.innerHTML = `
    <div class="confirmation-icon">🎉</div>
    <h1>Order Placed!</h1>
    <p class="order-id">Order #${order.id}</p>
    <p class="conf-message">
      Thank you for shopping with O Jaga! Your handcrafted treasures are being prepared 
      with love. We'll send a confirmation to <strong>${order.customer.email}</strong>.
    </p>
    <div class="order-summary-card">
      <h3>Order Details</h3>
      ${order.items.map(item => `
        <div class="order-detail-row">
          <span>${item.name} × ${item.quantity}</span>
          <strong>₹${item.subtotal.toLocaleString('en-IN')}</strong>
        </div>
      `).join('')}
      <div class="order-detail-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light);">
        <span>Shipping</span>
        <strong>${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</strong>
      </div>
      <div class="order-detail-row" style="font-size: 1rem;">
        <span><strong>Total Paid</strong></span>
        <strong style="color: var(--accent-primary);">₹${order.total.toLocaleString('en-IN')}</strong>
      </div>
    </div>
    <div class="order-summary-card">
      <h3>Delivery Address</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
        ${order.customer.name}<br>
        ${order.customer.address}<br>
        ${order.customer.city} - ${order.customer.pincode}<br>
        📞 ${order.customer.phone}
      </p>
    </div>
    <button class="btn btn-primary btn-lg" onclick="navigateTo('shop')">
      Continue Shopping →
    </button>
  `;

  navigateTo('confirmation');
}

// ═══════════════ TOAST NOTIFICATIONS ═══════════════

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ═══════════════ NAVBAR SCROLL EFFECT ═══════════════

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  const scrollTop = window.pageYOffset;

  if (scrollTop > 50) {
    navbar.style.background = 'rgba(10, 10, 11, 0.95)';
    navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
  } else {
    navbar.style.background = 'rgba(10, 10, 11, 0.85)';
    navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
  }

  lastScroll = scrollTop;
});

// ═══════════════ WELCOME FLOAT ═══════════════

function showWelcomeFloat() {
  const msg = document.getElementById('welcomeMsg');
  if (!msg) return;
  setTimeout(() => msg.classList.add('show'), 1500);
  setTimeout(() => msg.classList.remove('show'), 9000);
}

// ═══════════════ ARTIST PARTNER APPLICATION ═══════════════

async function submitPartnerApplication(event) {
  event.preventDefault();

  const btn = document.getElementById('partner-submit-btn');
  const form = document.getElementById('partner-form');

  const applicationData = {
    name: document.getElementById('artist-name').value,
    email: document.getElementById('artist-email').value,
    phone: document.getElementById('artist-phone').value,
    artStyle: document.getElementById('artist-style').value,
    portfolio: document.getElementById('artist-portfolio').value || ''
  };

  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });
    const data = await res.json();

    if (data.success) {
      // Show success state
      form.style.display = 'none';
      const successDiv = document.getElementById('partner-success');
      successDiv.style.display = 'block';
      document.getElementById('application-id').textContent = `Application ID: ${data.application.id}`;
      showToast('🎉 Application submitted successfully!');
    } else {
      showToast(data.message || 'Failed to submit. Please try again.', 'error');
    }
  } catch (err) {
    showToast('Connection error. Please try again.', 'error');
  }

  btn.textContent = '🎨 Submit Application';
  btn.disabled = false;
}

function resetPartnerForm() {
  const form = document.getElementById('partner-form');
  const successDiv = document.getElementById('partner-success');
  form.reset();
  form.style.display = 'block';
  successDiv.style.display = 'none';
}

// ═══════════════ INITIALIZATION ═══════════════

document.addEventListener('DOMContentLoaded', async () => {
  await loadHomePage();
  await fetchCart();
  showWelcomeFloat();
});
