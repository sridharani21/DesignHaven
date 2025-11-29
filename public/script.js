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
// Load categories - No defaults, start empty
let categories = [];
// Load products - No defaults, start empty
let products = [];

// Check if Firebase is available and configured
let useFirebase = false;
let database = null;

// Get firebaseConfig from global scope (defined in firebase-config.js)
let firebaseConfig = window.firebaseConfig || null;

// Wait for Firebase to be ready
function initFirebase() {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            // Make sure Firebase app is initialized
            try {
                const app = firebase.app();
                database = firebase.database();
                useFirebase = true;
                console.log('✅ Firebase connected - using cloud database for cross-device sync');
                if (firebaseConfig && firebaseConfig.databaseURL) {
                    console.log('📡 Database URL:', firebaseConfig.databaseURL);
                }
                return true;
            } catch (appError) {
                console.error('❌ Firebase app not initialized:', appError);
                // Try to initialize
                if (firebase.initializeApp && firebaseConfig) {
                    firebase.initializeApp(firebaseConfig);
                    database = firebase.database();
                    useFirebase = true;
                    console.log('✅ Firebase initialized and connected');
                    return true;
                } else {
                    console.error('❌ Cannot initialize Firebase: config not found');
                }
                return false;
            }
        } else {
            console.log('⚠️ Firebase not available - using localStorage (device-specific)');
            return false;
        }
    } catch (e) {
        console.error('❌ Firebase initialization error:', e);
        console.log('Falling back to localStorage');
        return false;
    }
}

// Initialize Firebase connection - wait for everything to load
(function() {
    function tryInitFirebase() {
        if (typeof firebase !== 'undefined') {
            initFirebase();
        } else {
            // Retry after a delay
            setTimeout(tryInitFirebase, 200);
        }
    }
    
    // Start trying to initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitFirebase);
    } else {
        setTimeout(tryInitFirebase, 100);
    }
})();

// Load data from Firebase or localStorage
async function loadDataFromStorage() {
    // Ensure Firebase is initialized
    if (!useFirebase && typeof firebase !== 'undefined') {
        initFirebase();
    }
    
    if (useFirebase && database) {
        try {
            // Load from Firebase (syncs across all devices)
            const categoriesSnapshot = await database.ref('categories').once('value');
            const productsSnapshot = await database.ref('products').once('value');
            const ordersSnapshot = await database.ref('orders').once('value');
            const offerBannerSnapshot = await database.ref('offerBanner').once('value');
            
            categories = categoriesSnapshot.val() || [];
            products = productsSnapshot.val() || [];
            orders = ordersSnapshot.val() || [];
            offerBanner = offerBannerSnapshot.val() || null;
            
            // Also sync to localStorage as backup
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('offerBanner', JSON.stringify(offerBanner));
            
            // Listen for real-time updates (remove old listeners first to avoid duplicates)
            database.ref('categories').off(); // Remove old listeners
            database.ref('categories').on('value', (snapshot) => {
                const newCategories = snapshot.val() || [];
                if (JSON.stringify(categories) !== JSON.stringify(newCategories)) {
                    categories = newCategories;
                    localStorage.setItem('categories', JSON.stringify(categories));
                    console.log('🔄 Categories updated from Firebase');
                    window.dispatchEvent(new CustomEvent('dataUpdated'));
                }
            });
            
            database.ref('products').off(); // Remove old listeners
            database.ref('products').on('value', (snapshot) => {
                const newProducts = snapshot.val() || [];
                if (JSON.stringify(products) !== JSON.stringify(newProducts)) {
                    products = newProducts;
                    localStorage.setItem('products', JSON.stringify(products));
                    console.log('🔄 Products updated from Firebase');
                    window.dispatchEvent(new CustomEvent('dataUpdated'));
                }
            });
            
            database.ref('orders').off(); // Remove old listeners
            database.ref('orders').on('value', (snapshot) => {
                const newOrders = snapshot.val() || [];
                if (JSON.stringify(orders) !== JSON.stringify(newOrders)) {
                    orders = newOrders;
                    localStorage.setItem('orders', JSON.stringify(orders));
                    console.log('🔄 Orders updated from Firebase');
                }
            });
            
            database.ref('offerBanner').off(); // Remove old listeners
            database.ref('offerBanner').on('value', (snapshot) => {
                const newBanner = snapshot.val() || null;
                if (JSON.stringify(offerBanner) !== JSON.stringify(newBanner)) {
                    offerBanner = newBanner;
                    localStorage.setItem('offerBanner', JSON.stringify(offerBanner));
                    console.log('🔄 Offer banner updated from Firebase');
                    window.dispatchEvent(new CustomEvent('dataUpdated'));
                }
            });
            
            console.log('👂 Listening for real-time updates from Firebase');
            
        } catch (e) {
            console.error('❌ Firebase error, falling back to localStorage:', e);
            if (e.code === 'PERMISSION_DENIED' || e.message.includes('permission')) {
                console.error('🔒 PERMISSION DENIED: Please update Firebase Database Rules!');
                console.error('📖 See FIX_PERMISSION_ERROR.md for instructions');
                console.error('🔗 Go to: https://console.firebase.google.com/project/designhaven-dcda4/database/rules');
            }
            useFirebase = false;
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    try {
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories !== null && storedCategories !== undefined) {
            const parsed = JSON.parse(storedCategories);
            if (Array.isArray(parsed)) {
                categories = parsed;
            } else {
                categories = [];
                localStorage.setItem('categories', JSON.stringify(categories));
            }
        } else {
            categories = [];
            localStorage.setItem('categories', JSON.stringify(categories));
        }
        
        const storedProducts = localStorage.getItem('products');
        if (storedProducts !== null && storedProducts !== undefined) {
            const parsed = JSON.parse(storedProducts);
            if (Array.isArray(parsed)) {
                products = parsed;
            } else {
                products = [];
                localStorage.setItem('products', JSON.stringify(products));
            }
        } else {
            products = [];
            localStorage.setItem('products', JSON.stringify(products));
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        categories = [];
        products = [];
    }
}

// Initialize other data (user-specific, stored locally)
let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userAddresses = JSON.parse(localStorage.getItem('userAddresses')) || {};
let offerBanner = null; // Will be loaded from Firebase/localStorage
let orders = []; // Will be loaded from Firebase/localStorage

// Initialize data loading (will populate categories, products, orders, offerBanner)
loadDataFromStorage();

// Secure data validation and sanitization
function validateData() {
    // Validate users array
    if (!Array.isArray(users)) {
        users = [];
    }
    users = users.filter(u => {
        if (!u || typeof u !== 'object') return false;
        if (!u.email || typeof u.email !== 'string' || u.email.length > 100) return false;
        if (!u.name || typeof u.name !== 'string' || u.name.length > 100) return false;
        if (!u.password || typeof u.password !== 'string' || u.password.length > 200) return false;
        return true;
    });
    
    // Validate categories array
    if (!Array.isArray(categories)) {
        categories = [];
    }
    categories = categories.filter(c => {
        if (!c || typeof c !== 'object') return false;
        if (!c.id || typeof c.id !== 'number') return false;
        if (!c.name || typeof c.name !== 'string' || c.name.length > 100) return false;
        if (!c.image || typeof c.image !== 'string' || c.image.length > 500) return false;
        return true;
    });
    
    // Validate products array
    if (!Array.isArray(products)) {
        products = [];
    }
    products = products.filter(p => {
        if (!p || typeof p !== 'object') return false;
        if (!p.id || typeof p.id !== 'number') return false;
        if (!p.name || typeof p.name !== 'string' || p.name.length > 200) return false;
        if (typeof p.price !== 'number' || p.price < 0 || p.price > 1000000) return false;
        if (!p.category || typeof p.category !== 'string' || p.category.length > 100) return false;
        if (!p.image || typeof p.image !== 'string' || p.image.length > 500) return false;
        if (p.description && (typeof p.description !== 'string' || p.description.length > 1000)) return false;
        return true;
    });
    
    // Validate orders array
    if (!Array.isArray(orders)) {
        orders = [];
    }
    orders = orders.filter(o => {
        if (!o || typeof o !== 'object') return false;
        if (!o.id || typeof o.id !== 'string' || o.id.length > 50) return false;
        if (typeof o.amount !== 'number' || o.amount < 0 || o.amount > 1000000) return false;
        if (!Array.isArray(o.items)) return false;
        return true;
    });
    
    // Validate offer banner
    if (offerBanner && (typeof offerBanner !== 'object' || typeof offerBanner.text !== 'string' || offerBanner.text.length > 200)) {
        offerBanner = null;
    }
}

// Save data to Firebase (for cross-device sync) or localStorage
async function saveData() {
    try {
        // Validate and sanitize data before saving
        validateData();
        
        // Ensure Firebase is initialized
        if (!useFirebase && typeof firebase !== 'undefined') {
            initFirebase();
        }
        
        // Save to Firebase if available (syncs across ALL devices)
        if (useFirebase && database) {
            try {
                console.log('💾 Saving to Firebase...');
                await database.ref('categories').set(categories);
                await database.ref('products').set(products);
                await database.ref('orders').set(orders);
                await database.ref('offerBanner').set(offerBanner);
                console.log('✅ Data saved to Firebase - will sync to all devices');
                // Also save to localStorage as backup
                saveToLocalStorage();
            } catch (e) {
                console.error('❌ Firebase save error:', e);
                console.error('Error details:', e.message, e.code);
                // Fallback to localStorage
                saveToLocalStorage();
            }
        } else {
            console.log('💾 Saving to localStorage only (Firebase not available)');
            saveToLocalStorage();
        }
        
        // Always save user-specific data to localStorage (cart, currentUser, etc.)
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('reviews', JSON.stringify(reviews));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('userAddresses', JSON.stringify(userAddresses));
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('dataUpdated', { 
            detail: { 
                categories, 
                products, 
                offerBanner,
                orders 
            } 
        }));
    } catch (e) {
        console.error('Error saving data:', e);
        alert('Error saving data. Please try again.');
    }
}

function saveToLocalStorage() {
    try {
        // Check localStorage quota
        const testKey = '__storage_test__';
        try {
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please clear some data.');
                return;
            }
        }
        
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('offerBanner', JSON.stringify(offerBanner));
        localStorage.setItem('lastUpdate', Date.now().toString());
        
        // Trigger storage event for cross-tab sync
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error('localStorage save error:', e);
        if (e.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please clear browser cache.');
        }
    }
}

// Reload data from Firebase or localStorage
async function reloadData() {
    // Ensure Firebase is initialized
    if (!useFirebase && typeof firebase !== 'undefined') {
        initFirebase();
    }
    
    if (useFirebase && database) {
        try {
            // Firebase automatically syncs, but we can force a refresh
            const categoriesSnapshot = await database.ref('categories').once('value');
            const productsSnapshot = await database.ref('products').once('value');
            const ordersSnapshot = await database.ref('orders').once('value');
            const offerBannerSnapshot = await database.ref('offerBanner').once('value');
            
            categories = categoriesSnapshot.val() || [];
            products = productsSnapshot.val() || [];
            orders = ordersSnapshot.val() || [];
            offerBanner = offerBannerSnapshot.val() || null;
            
            // Update localStorage as backup
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('offerBanner', JSON.stringify(offerBanner));
        } catch (e) {
            console.error('❌ Firebase reload error:', e);
            if (e.code === 'PERMISSION_DENIED' || e.message.includes('permission')) {
                console.error('🔒 PERMISSION DENIED: Please update Firebase Database Rules!');
                console.error('📖 See FIX_PERMISSION_ERROR.md for instructions');
                console.error('🔗 Go to: https://console.firebase.google.com/project/designhaven-dcda4/database/rules');
                // Don't keep retrying if permission is denied
                useFirebase = false;
            }
            loadFromLocalStorage();
        }
    } else {
        // Reload from localStorage
        try {
            const storedCategories = localStorage.getItem('categories');
            if (storedCategories !== null && storedCategories !== undefined) {
                const parsed = JSON.parse(storedCategories);
                if (Array.isArray(parsed)) {
                    categories = parsed;
                }
            }
            
            const storedProducts = localStorage.getItem('products');
            if (storedProducts !== null && storedProducts !== undefined) {
                const parsed = JSON.parse(storedProducts);
                if (Array.isArray(parsed)) {
                    products = parsed;
                }
            }
            
            const storedBanner = localStorage.getItem('offerBanner');
            if (storedBanner !== null && storedBanner !== undefined) {
                try {
                    offerBanner = JSON.parse(storedBanner);
                } catch (e) {
                    offerBanner = null;
                }
            } else {
                offerBanner = null;
            }
            
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders !== null && storedOrders !== undefined) {
                const parsed = JSON.parse(storedOrders);
                if (Array.isArray(parsed)) {
                    orders = parsed;
                }
            }
        } catch (e) {
            console.error('Error reloading data:', e);
        }
    }
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
    const ordersLink = document.getElementById('ordersLink');
    
    // Always show "My Orders" link
    if (ordersLink) {
        ordersLink.style.display = 'block';
    }
    
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
        // Also remove products in this category
        products = products.filter(p => p.category !== categories.find(c => c.id === id)?.name);
        saveData();
        loadCategoriesList();
        
        // Force refresh customer pages
        window.dispatchEvent(new CustomEvent('dataUpdated'));
        
        // Also reload data to ensure consistency
        reloadData();
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
        alert('Category saved successfully! Changes will be reflected on customer pages.');
        
        // Force refresh customer pages if open
        window.dispatchEvent(new CustomEvent('dataUpdated'));
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
        alert('Product saved successfully! Changes will be reflected on customer pages.');
        
        // Force refresh customer pages if open
        window.dispatchEvent(new CustomEvent('dataUpdated'));
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
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase first
    if (typeof firebase !== 'undefined') {
        initFirebase();
    }
    
    // Wait for data to load (Firebase or localStorage)
    await loadDataFromStorage();
    
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
    const mobileToggle = document.getElementById('mobileMenuToggle') || document.querySelector('.mobile-menu-toggle');
    const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
    
    // Update cart count on all pages
    updateCartCount();
    
    // Refresh page content when data is updated
    function refreshPageContent() {
        const currentPath = window.location.pathname.toLowerCase();
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Reload data first
        reloadData();
        
        // Refresh display based on current page
        if (currentPage === 'index.html' || currentPage === '' || !currentPage.includes('.')) {
            loadCategories('categoriesGrid');
            loadProducts('productsGrid');
            displayOfferBanner();
        } else if (currentPage === 'categories.html') {
            loadCategories('categoriesGridLarge');
        } else if (currentPage === 'products.html') {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            loadProducts('productsGridPage', category);
        } else if (currentPage === 'product-detail.html') {
            loadProductDetail();
        } else if (currentPage === 'admin.html') {
            loadCategoriesList();
            loadProductsList();
            loadAdminOrders();
            displayOfferBanner();
        } else if (currentPage === 'orders.html') {
            loadOrders();
        }
    }
    
    // Listen for data updates in same tab
    window.addEventListener('dataUpdated', () => {
        refreshPageContent();
    });
    
    // Set up periodic data refresh (every 1 second) to catch admin changes quickly
    setInterval(() => {
        reloadData();
        refreshPageContent();
    }, 1000);
    
    // Also refresh on window focus (when user switches tabs/windows)
    window.addEventListener('focus', () => {
        reloadData();
        refreshPageContent();
    });
    
    // Refresh when storage changes (cross-tab sync within same browser)
    window.addEventListener('storage', (e) => {
        if (e.key === 'categories' || e.key === 'products' || e.key === 'offerBanner' || e.key === 'orders') {
            reloadData();
            refreshPageContent();
        }
    });
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

function openPaymentApp(app, customAmount = null) {
    const amount = customAmount !== null ? customAmount : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

function openPaymentAppForOrder(app, amount) {
    openPaymentApp(app, amount);
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
        const isCOD = order.paymentMethod === 'cod';
        const paymentStatusBadge = isCOD ? 
            '<span class="payment-badge payment-pending" style="margin-left: 1rem;">Cash on Delivery</span>' : 
            '<span class="payment-badge payment-paid" style="margin-left: 1rem;">Paid Online</span>';
        
        orderCard.innerHTML = `
            <div class="order-card-header">
                <div>
                    <h3>Order ${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="order-status-badge status-${order.status.replace(/\s+/g, '-')}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    ${paymentStatusBadge}
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
                    <div style="display: flex; gap: 0.5rem;">
                        ${isCOD && order.status !== 'delivered' ? 
                            `<button class="btn-primary" onclick="convertToOnlinePayment('${order.id}')">Pay Online</button>` : 
                            ''
                        }
                        <a href="order-tracking.html?id=${order.id}" class="btn-secondary">Track Order</a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(orderCard);
    });
}

function convertToOnlinePayment(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.paymentMethod !== 'cod') {
        alert('Invalid order or already paid online.');
        return;
    }
    
    if (confirm(`Convert order ${orderId} to online payment? Amount: ₹${order.amount.toLocaleString('en-IN')}`)) {
        // Show payment QR code
        const amount = order.amount;
        const upiId = 'sridharani916@okaxis';
        
        // Create payment modal
        const paymentModal = document.createElement('div');
        paymentModal.className = 'payment-modal';
        paymentModal.innerHTML = `
            <div class="payment-modal-content">
                <h2>Pay for Order ${orderId}</h2>
                <div class="payment-qr-section">
                    <div class="qr-code-container">
                        <canvas id="paymentQRCode"></canvas>
                    </div>
                    <p class="upi-id">UPI ID: ${upiId}</p>
                    <p class="amount-display">Amount: ₹${amount.toLocaleString('en-IN')}</p>
                    <div class="payment-apps">
                        <button class="payment-app-btn" onclick="openPaymentAppForOrder('gpay', ${amount})">Pay with Google Pay</button>
                        <button class="payment-app-btn" onclick="openPaymentAppForOrder('phonepe', ${amount})">Pay with PhonePe</button>
                        <button class="payment-app-btn" onclick="openPaymentAppForOrder('paytm', ${amount})">Pay with Paytm</button>
                    </div>
                    <button class="btn-primary btn-full" onclick="confirmOnlinePayment('${orderId}')">I've Paid</button>
                    <button class="btn-secondary btn-full" onclick="closePaymentModal()" style="margin-top: 0.5rem;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(paymentModal);
        
        // Generate QR code
        setTimeout(() => {
            generateUPIQRForOrder(amount, 'paymentQRCode');
        }, 100);
    }
}

function generateUPIQRForOrder(amount, canvasId) {
    const upiId = 'sridharani916@okaxis';
    const upiString = `upi://pay?pa=${upiId}&pn=DesignHaven&am=${amount}&cu=INR`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) return;
    
    if (typeof QRCode !== 'undefined') {
        try {
            QRCode.toCanvas(canvas, upiString, {
                width: 250,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) {
                    generateQRWithAPI(upiString, canvas);
                }
            });
        } catch (e) {
            generateQRWithAPI(upiString, canvas);
        }
    } else {
        generateQRWithAPI(upiString, canvas);
    }
}

function confirmOnlinePayment(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.paymentMethod = 'online';
        saveData();
        alert('Payment method updated to online!');
        closePaymentModal();
        loadOrders();
    }
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

window.convertToOnlinePayment = convertToOnlinePayment;
window.confirmOnlinePayment = confirmOnlinePayment;
window.closePaymentModal = closePaymentModal;
window.openPaymentAppForOrder = openPaymentAppForOrder;

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
        
        // Force refresh customer pages if open
        window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openPaymentApp = openPaymentApp;
window.updateOrderStatus = updateOrderStatus;
window.generateReceipt = generateReceipt;

