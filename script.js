// Data Storage
let users = [];
try {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
        if (!Array.isArray(users)) {
            users = [];
        } else {
            // Clean up invalid user entries
            users = users.filter(u => u && u.email && u.name && u.password);
        }
    }
} catch (e) {
    users = [];
    localStorage.setItem('users', JSON.stringify(users));
}
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Posters', image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400' },
    { id: 2, name: 'Customized Designs', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400' },
    { id: 3, name: 'Wall Art', image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400' },
    { id: 4, name: 'Digital Prints', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400' }
];
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Vintage Poster Collection', price: 2499, category: 'Posters', image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400', description: 'Beautiful vintage-inspired poster collection perfect for any room.' },
    { id: 2, name: 'Custom Portrait Design', price: 4199, category: 'Customized Designs', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', description: 'Personalized portrait design created just for you.' },
    { id: 3, name: 'Modern Abstract Art', price: 3399, category: 'Wall Art', image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400', description: 'Contemporary abstract art piece to enhance your space.' },
    { id: 4, name: 'Nature Photography Print', price: 2099, category: 'Digital Prints', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', description: 'High-quality nature photography print in stunning detail.' }
];
let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
let offerBanner = JSON.parse(localStorage.getItem('offerBanner')) || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userAddresses = JSON.parse(localStorage.getItem('userAddresses')) || {};
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Save data to localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('reviews', JSON.stringify(reviews));
    localStorage.setItem('offerBanner', JSON.stringify(offerBanner));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('userAddresses', JSON.stringify(userAddresses));
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.name && currentUser.name.toLowerCase() === 'sridharani';
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (isAdmin() && adminLink) {
            adminLink.style.display = 'block';
            adminLink.href = 'admin.html';
        }
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// Display offer banner
function displayOfferBanner() {
    const bannerElement = document.getElementById('offerBanner');
    const bannerText = document.getElementById('bannerText');
    
    if (bannerElement && offerBanner && offerBanner.text) {
        bannerElement.style.display = 'block';
        if (bannerText) bannerText.textContent = offerBanner.text;
    } else if (bannerElement) {
        bannerElement.style.display = 'none';
    }
}

function closeBanner() {
    const bannerElement = document.getElementById('offerBanner');
    if (bannerElement) {
        bannerElement.style.display = 'none';
    }
}

// Register functionality
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim().toLowerCase();
        const password = document.getElementById('registerPassword').value;
        const errorDiv = document.getElementById('registerError');
        const successDiv = document.getElementById('registerSuccess');
        
        // Prevent registering with admin name
        if (name.toLowerCase() === 'sridharani') {
            if (errorDiv) {
                errorDiv.textContent = 'This username is not available. Please choose another.';
                errorDiv.style.display = 'block';
                if (successDiv) successDiv.style.display = 'none';
            }
            return;
        }
        
        // Check if user already exists (case-insensitive email check)
        const existingUser = users.find(u => {
            if (!u || !u.email || !u.name) return false;
            return u.email.toLowerCase() === email || u.name.toLowerCase() === name.toLowerCase();
        });
        if (existingUser) {
            if (errorDiv) {
                errorDiv.textContent = 'Email or username already registered. Please login.';
                errorDiv.style.display = 'block';
                if (successDiv) successDiv.style.display = 'none';
            }
            return;
        }
        
        // Validate inputs
        if (!name || !email || !password) {
            if (errorDiv) {
                errorDiv.textContent = 'Please fill in all fields.';
                errorDiv.style.display = 'block';
                if (successDiv) successDiv.style.display = 'none';
            }
            return;
        }
        
        // Add new user
        users.push({ id: Date.now(), name, email, password });
        saveData();
        
        if (successDiv) {
            successDiv.textContent = 'Registration successful! Redirecting to login...';
            successDiv.style.display = 'block';
            if (errorDiv) errorDiv.style.display = 'none';
        }
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

// Login functionality
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailOrName = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        // Check for admin login (case-insensitive name check)
        if (emailOrName.toLowerCase() === 'sridharani' && password === 'xyz@@21') {
            currentUser = { name: 'sridharani', email: 'admin@designhaven.com' };
            saveData();
            window.location.href = 'admin.html';
            return;
        }
        
        // Check for regular user
        const user = users.find(u => {
            if (!u || !u.email || !u.name) return false;
            const emailMatch = u.email.toLowerCase() === emailOrName.toLowerCase();
            const nameMatch = u.name.toLowerCase() === emailOrName.toLowerCase();
            return (emailMatch || nameMatch) && u.password === password;
        });
        
        if (user) {
            currentUser = { name: user.name, email: user.email };
            saveData();
            window.location.href = 'index.html';
        } else {
            if (errorDiv) {
                errorDiv.textContent = 'Invalid credentials. Please try again.';
                errorDiv.style.display = 'block';
            }
        }
    });
}

// Logout functionality
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = null;
        saveData();
        window.location.href = 'index.html';
    });
}

// Load categories
function loadCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    categories.forEach(category => {
        const categoryCard = document.createElement('a');
        categoryCard.href = `products.html?category=${encodeURIComponent(category.name)}`;
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <img src="${category.image}" alt="${category.name}" class="category-image">
            <div class="category-info">
                <h3 class="category-name">${category.name}</h3>
            </div>
        `;
        container.appendChild(categoryCard);
    });
}

// Load products
function loadProducts(containerId, categoryFilter = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    let filteredProducts = categoryFilter 
        ? products.filter(p => p.category === categoryFilter)
        : products;
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <a href="product-detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
                </div>
            </a>
            <button class="btn-primary" style="width: 100%; margin-top: 0.5rem; padding: 0.75rem;" onclick="addToCart(${product.id}); event.stopPropagation();">Add to Cart</button>
        `;
        container.appendChild(productCard);
    });
}

// Load product detail
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const wrapper = document.getElementById('productDetailWrapper');
    const addToCartSection = document.getElementById('addToCartSection');
    
    if (!wrapper || !productId) {
        if (wrapper) wrapper.innerHTML = '<p>Product not found.</p>';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        wrapper.innerHTML = '<p>Product not found.</p>';
        return;
    }
    
    wrapper.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-detail-image">
        <div class="product-detail-info">
            <h1>${product.name}</h1>
            <p class="product-detail-price">₹${product.price.toLocaleString('en-IN')}</p>
            <span class="product-detail-category">${product.category}</span>
            <p class="product-detail-description">${product.description}</p>
        </div>
    `;
    
    if (addToCartSection) {
        addToCartSection.style.display = 'block';
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => addToCart(productId);
        }
    }
    
    loadReviews(productId);
}

// Load reviews
function loadReviews(productId) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    const productReviews = reviews[productId] || [];
    container.innerHTML = '';
    
    if (productReviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    productReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        reviewCard.innerHTML = `
            <div class="review-header">
                <span class="reviewer-name">${review.name}</span>
                <span class="review-rating">${stars}</span>
            </div>
            <p class="review-comment">${review.comment}</p>
        `;
        container.appendChild(reviewCard);
    });
}

// Submit review
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (!productId) return;
        
        const name = document.getElementById('reviewerName').value;
        const rating = parseInt(document.getElementById('reviewRating').value);
        const comment = document.getElementById('reviewComment').value;
        
        if (!reviews[productId]) {
            reviews[productId] = [];
        }
        
        reviews[productId].push({
            name,
            rating,
            comment,
            date: new Date().toISOString()
        });
        
        saveData();
        loadReviews(productId);
        reviewForm.reset();
        
        alert('Thank you for your review!');
    });
}

// Admin: Banner Management
const bannerForm = document.getElementById('bannerForm');
if (bannerForm) {
    bannerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('bannerText').value;
        if (text.trim()) {
            offerBanner = { text: text.trim() };
            saveData();
            alert('Banner updated successfully!');
            displayOfferBanner();
        }
    });
}

function removeBanner() {
    offerBanner = null;
    saveData();
    alert('Banner removed!');
    displayOfferBanner();
}

// Admin: Category Management
function loadCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = '';
    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <h4>${category.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">ID: ${category.id}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" onclick="editCategory(${category.id})">Edit</button>
                <button class="btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryImage').value = category.image;
    document.getElementById('categoryId').value = id;
    document.getElementById('categorySubmitBtn').textContent = 'Update Category';
}

function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        categories = categories.filter(c => c.id !== id);
        saveData();
        loadCategoriesList();
    }
}

function resetCategoryForm() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categorySubmitBtn').textContent = 'Add Category';
}

const categoryForm = document.getElementById('categoryForm');
if (categoryForm) {
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value;
        const image = document.getElementById('categoryImage').value;
        
        if (id) {
            // Update existing
            const index = categories.findIndex(c => c.id === parseInt(id));
            if (index !== -1) {
                categories[index] = { ...categories[index], name, image };
            }
        } else {
            // Add new
            const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
            categories.push({ id: newId, name, image });
        }
        
        saveData();
        loadCategoriesList();
        resetCategoryForm();
        alert('Category saved successfully!');
    });
}

// Admin: Product Management
function loadProductsList() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div class="admin-item-info">
                <h4>${product.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">₹${product.price.toLocaleString('en-IN')} - ${product.category}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productId').value = id;
    document.getElementById('productSubmitBtn').textContent = 'Update Product';
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveData();
        loadProductsList();
    }
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
}

const productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const image = document.getElementById('productImage').value;
        const description = document.getElementById('productDescription').value;
        
        if (id) {
            // Update existing
            const index = products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                products[index] = { ...products[index], name, price, category, image, description };
            }
        } else {
            // Add new
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, name, price, category, image, description });
        }
        
        saveData();
        loadProductsList();
        resetProductForm();
        alert('Product saved successfully!');
    });
}

// Populate category dropdown in admin
function populateCategoryDropdown() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Populate category filter
function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    select.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        const filter = e.target.value || null;
        loadProducts('productsGridPage', filter);
    });
}

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    displayOfferBanner();
    
    const currentPath = window.location.pathname.toLowerCase();
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Check admin access
    if (currentPage === 'admin.html' && !isAdmin()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load content based on page
    if (currentPage === 'index.html' || currentPage === '' || !currentPage.includes('.')) {
        loadCategories('categoriesGrid');
        loadProducts('productsGrid');
    } else if (currentPage === 'categories.html') {
        loadCategories('categoriesGridLarge');
    } else if (currentPage === 'products.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        populateCategoryFilter();
        loadProducts('productsGridPage', category);
        if (category) {
            const filterSelect = document.getElementById('categoryFilter');
            if (filterSelect) filterSelect.value = category;
        }
    } else if (currentPage === 'product-detail.html') {
        loadProductDetail();
    } else if (currentPage === 'cart.html') {
        loadCart();
    } else if (currentPage === 'checkout.html') {
        loadCheckout();
    } else if (currentPage === 'order-tracking.html') {
        loadOrderTracking();
    } else if (currentPage === 'orders.html') {
        loadOrders();
    } else if (currentPage === 'admin.html') {
        loadCategoriesList();
        loadProductsList();
        loadAdminOrders();
        populateCategoryDropdown();
        const bannerTextInput = document.getElementById('bannerText');
        if (bannerTextInput && offerBanner && offerBanner.text) {
            bannerTextInput.value = offerBanner.text;
        }
    }
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Update cart count on all pages
    updateCartCount();
});

// Cart Functions
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        if (el) el.textContent = totalItems;
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveData();
    updateCartCount();
    alert('Product added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveData();
    updateCartCount();
    loadCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveData();
    updateCartCount();
    loadCart();
}

function loadCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <a href="products.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Products</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    if (cartSummary) {
        cartSummary.style.display = 'block';
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        document.getElementById('total').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    }
}

function loadCheckout() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (!checkoutItems || cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    checkoutItems.innerHTML = '';
    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <span class="checkout-item-name">${item.name}</span>
            <span class="checkout-item-qty">x${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
        `;
        checkoutItems.appendChild(checkoutItem);
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (checkoutSubtotal) checkoutSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (checkoutTotal) checkoutTotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    
    // Load saved address if exists
    if (currentUser && userAddresses[currentUser.email]) {
        const address = userAddresses[currentUser.email];
        document.getElementById('fullName').value = address.fullName || '';
        document.getElementById('phone').value = address.phone || '';
        document.getElementById('addressLine1').value = address.addressLine1 || '';
        document.getElementById('addressLine2').value = address.addressLine2 || '';
        document.getElementById('city').value = address.city || '';
        document.getElementById('state').value = address.state || '';
        document.getElementById('pincode').value = address.pincode || '';
        document.getElementById('landmark').value = address.landmark || '';
    }
}

function generateUPIQR(amount) {
    const upiId = 'sridharani916@okaxis';
    const upiString = `upi://pay?pa=${upiId}&pn=DesignHaven&am=${amount}&cu=INR`;
    const canvas = document.getElementById('qrCode');
    const qrContainer = canvas ? canvas.parentElement : null;
    
    if (!canvas || !qrContainer) {
        console.error('QR code container not found');
        return;
    }
    
    // Clear any existing content
    qrContainer.innerHTML = '<canvas id="qrCode"></canvas>';
    const newCanvas = document.getElementById('qrCode');
    
    // Try using QRCode.js library first
    if (typeof QRCode !== 'undefined') {
        try {
            QRCode.toCanvas(newCanvas, upiString, {
                width: 250,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    console.error('QR Code generation error:', error);
                    generateQRWithAPI(upiString, newCanvas);
                }
            });
        } catch (e) {
            console.error('QRCode library error:', e);
            generateQRWithAPI(upiString, newCanvas);
        }
    } else {
        // Fallback: Use API to generate QR code
        console.log('QRCode library not loaded, using API fallback');
        generateQRWithAPI(upiString, newCanvas);
    }
}

function generateQRWithAPI(upiString, canvas) {
    // Use qr-server.com API as fallback
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = qrUrl;
    img.style.width = '250px';
    img.style.height = '250px';
    img.onload = () => {
        try {
            const ctx = canvas.getContext('2d');
            canvas.width = 250;
            canvas.height = 250;
            ctx.drawImage(img, 0, 0);
        } catch (e) {
            // If canvas drawing fails, replace with img
            canvas.parentElement.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: 250px; height: 250px;">`;
        }
    };
    img.onerror = () => {
        // If API fails, show UPI string
        canvas.parentElement.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <p style="margin-bottom: 1rem; font-weight: 600;">UPI Payment Details:</p>
                <p style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary-color);">sridharani916@okaxis</p>
                <p style="color: var(--text-secondary);">Please use this UPI ID to make payment</p>
                <p style="margin-top: 1rem; font-weight: 600;">Amount: ₹${document.getElementById('qrAmount') ? document.getElementById('qrAmount').textContent : ''}</p>
            </div>
        `;
    };
}

function openPaymentApp(app) {
    const amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const upiId = 'sridharani916@okaxis';
    
    let url = '';
    switch(app) {
        case 'gpay':
            url = `tez://upi/pay?pa=${upiId}&pn=DesignHaven&am=${amount}&cu=INR`;
            break;
        case 'phonepe':
            url = `phonepe://pay?pa=${upiId}&pn=DesignHaven&am=${amount}&cu=INR`;
            break;
        case 'paytm':
            url = `paytmmp://pay?pa=${upiId}&pn=DesignHaven&am=${amount}&cu=INR`;
            break;
    }
    
    if (url) {
        window.location.href = url;
        setTimeout(() => {
            // Fallback to UPI string if app not installed
            const upiString = `upi://pay?pa=${upiId}&pn=DesignHaven&am=${amount}&cu=INR`;
            window.location.href = upiString;
        }, 500);
    }
}

// Checkout form submission
const placeOrderBtn = document.getElementById('placeOrderBtn');
if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const addressForm = document.getElementById('addressForm');
        if (!addressForm.checkValidity()) {
            addressForm.reportValidity();
            return;
        }
        
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        // Save address if checkbox is checked
        if (currentUser && document.getElementById('saveAddress').checked) {
            userAddresses[currentUser.email] = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                addressLine1: document.getElementById('addressLine1').value,
                addressLine2: document.getElementById('addressLine2').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value,
                landmark: document.getElementById('landmark').value
            };
            saveData();
        }
        
        // Create order
        const orderId = 'ORD' + Date.now();
        const amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const order = {
            id: orderId,
            userId: currentUser ? currentUser.email : 'guest',
            items: [...cart],
            address: {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                addressLine1: document.getElementById('addressLine1').value,
                addressLine2: document.getElementById('addressLine2').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value,
                landmark: document.getElementById('landmark').value
            },
            paymentMethod: paymentMethod.value,
            amount: amount,
            status: 'ordered',
            date: new Date().toISOString()
        };
        
        if (paymentMethod.value === 'cod') {
            // Cash on Delivery
            orders.push(order);
            saveData();
            alert(`Order placed successfully! Order ID: ${orderId}. You will pay on delivery.`);
            cart = [];
            saveData();
            updateCartCount();
            window.location.href = `order-tracking.html?id=${orderId}`;
        } else {
            // Online payment - show QR code
            document.getElementById('qrAmount').textContent = `₹${amount.toLocaleString('en-IN')}`;
            document.getElementById('paymentQR').style.display = 'block';
            generateUPIQR(amount);
            placeOrderBtn.style.display = 'none';
            
            // Store pending order
            window.pendingOrder = order;
        }
    });
}

// Payment redirect handling - check if user is returning from payment
if (window.location.search.includes('payment=success')) {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId && window.pendingOrder && window.pendingOrder.id === orderId) {
        orders.push(window.pendingOrder);
        saveData();
        cart = [];
        saveData();
        updateCartCount();
        window.location.href = `payment-success.html?orderId=${orderId}`;
    }
}

const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        window.location.href = 'checkout.html';
    });
}

// Make functions globally available
window.closeBanner = closeBanner;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.resetCategoryForm = resetCategoryForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.resetProductForm = resetProductForm;
window.removeBanner = removeBanner;
// Order Tracking Functions
function loadOrderTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const content = document.getElementById('orderTrackingContent');
    
    if (!content || !orderId) {
        if (content) content.innerHTML = '<p>Order not found.</p>';
        return;
    }
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        content.innerHTML = '<p>Order not found.</p>';
        return;
    }
    
    const statusSteps = ['ordered', 'packing', 'out for delivery', 'delivered'];
    const currentStatusIndex = statusSteps.indexOf(order.status);
    
    let statusHTML = '';
    statusSteps.forEach((status, index) => {
        const isActive = index <= currentStatusIndex;
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        statusHTML += `
            <div class="status-step ${isActive ? 'active' : ''}">
                <div class="status-icon">${isActive ? '✓' : '○'}</div>
                <div class="status-label">${statusLabel}</div>
            </div>
        `;
    });
    
    content.innerHTML = `
        <div class="order-tracking-card">
            <h2>Order Details</h2>
            <div class="order-info">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹${order.amount.toLocaleString('en-IN')}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            </div>
            
            <h3 style="margin-top: 2rem;">Order Status</h3>
            <div class="status-timeline">
                ${statusHTML}
            </div>
            
            <div class="order-items-section">
                <h3>Order Items</h3>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-address-section">
                <h3>Delivery Address</h3>
                <p>${order.address.fullName}</p>
                <p>${order.address.phone}</p>
                <p>${order.address.addressLine1}</p>
                ${order.address.addressLine2 ? `<p>${order.address.addressLine2}</p>` : ''}
                <p>${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
                ${order.address.landmark ? `<p>Landmark: ${order.address.landmark}</p>` : ''}
            </div>
        </div>
    `;
}

function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = '<p>Please login to view your orders.</p>';
        return;
    }
    
    const userOrders = orders.filter(o => o.userId === currentUser.email).reverse();
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h2>No orders yet</h2>
                <p>Start shopping to see your orders here!</p>
                <a href="products.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Products</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    userOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-card-header">
                <div>
                    <h3>Order ${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status-badge status-${order.status.replace(/\s+/g, '-')}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
            </div>
            <div class="order-card-body">
                <div class="order-items-preview">
                    ${order.items.slice(0, 2).map(item => `
                        <span>${item.name} x${item.quantity}</span>
                    `).join(', ')}
                    ${order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                </div>
                <div class="order-card-footer">
                    <span class="order-amount">₹${order.amount.toLocaleString('en-IN')}</span>
                    <a href="order-tracking.html?id=${order.id}" class="btn-secondary">Track Order</a>
                </div>
            </div>
        `;
        container.appendChild(orderCard);
    });
}

function loadAdminOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No orders yet.</p>';
        return;
    }
    
    container.innerHTML = '';
    orders.reverse().forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'admin-order-card';
        const paymentStatus = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online';
        const paymentStatusClass = order.paymentMethod === 'cod' ? 'payment-pending' : 'payment-paid';
        
        orderCard.innerHTML = `
            <div class="admin-order-header">
                <div>
                    <h3>${order.id}</h3>
                    <p class="order-meta">Customer: ${order.userId} | Date: ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-amount-badge">₹${order.amount.toLocaleString('en-IN')}</div>
            </div>
            
            <div class="admin-order-body">
                <div class="order-items-admin">
                    <h4>Order Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item-admin">
                            <span>${item.name} x${item.quantity}</span>
                            <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-details-grid">
                    <div class="detail-item">
                        <strong>Payment Status:</strong>
                        <span class="payment-badge ${paymentStatusClass}">${paymentStatus}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Order Status:</strong>
                        <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="ordered" ${order.status === 'ordered' ? 'selected' : ''}>Ordered</option>
                            <option value="packing" ${order.status === 'packing' ? 'selected' : ''}>Packing</option>
                            <option value="out for delivery" ${order.status === 'out for delivery' ? 'selected' : ''}>Out for Delivery</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </div>
                </div>
                
                <div class="order-address-admin">
                    <h4>Delivery Address:</h4>
                    <p>${order.address.fullName}, ${order.address.phone}</p>
                    <p>${order.address.addressLine1}${order.address.addressLine2 ? ', ' + order.address.addressLine2 : ''}</p>
                    <p>${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
                </div>
                
                <button class="btn-secondary" onclick="generateReceipt('${order.id}')">View E-Receipt</button>
            </div>
        `;
        container.appendChild(orderCard);
    });
}

function generateReceipt(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const receiptWindow = window.open('', '_blank', 'width=600,height=800');
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 2rem; }
                .receipt-header { text-align: center; border-bottom: 2px solid #FF69B4; padding-bottom: 1rem; margin-bottom: 2rem; }
                .receipt-header h1 { color: #FF69B4; margin: 0; }
                .receipt-info { margin-bottom: 2rem; }
                .receipt-info p { margin: 0.5rem 0; }
                .receipt-items { margin: 2rem 0; }
                .receipt-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
                .receipt-total { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #FF69B4; font-size: 1.2rem; font-weight: bold; }
                .receipt-footer { margin-top: 3rem; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <h1>DesignHaven</h1>
                <p>E-Receipt</p>
            </div>
            <div class="receipt-info">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Customer:</strong> ${order.userId}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            </div>
            <div class="receipt-items">
                <h3>Items:</h3>
                ${order.items.map(item => `
                    <div class="receipt-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                `).join('')}
            </div>
            <div class="receipt-total">
                <p>Total: ₹${order.amount.toLocaleString('en-IN')}</p>
            </div>
            <div class="receipt-footer">
                <p>Thank you for your purchase!</p>
                <p>DesignHaven - Creating beautiful designs for every occasion</p>
            </div>
        </body>
        </html>
    `;
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    receiptWindow.print();
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveData();
        alert('Order status updated successfully!');
        loadAdminOrders();
    }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openPaymentApp = openPaymentApp;
window.updateOrderStatus = updateOrderStatus;
window.generateReceipt = generateReceipt;

