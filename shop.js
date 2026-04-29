// Sample data (fallback)
let products = [
    { id: 1, name: 'Fresh Tomatoes', price: 120, seller: 'GreenFarm', image: '🍅' },
    { id: 2, name: 'Organic Potatoes', price: 80, seller: 'FarmFresh', image: '🥔' },
    { id: 3, name: 'Green Onions', price: 60, seller: 'VeggieHub', image: '🧅' },
    { id: 4, name: 'Fresh Carrots', price: 100, seller: 'RootVeggies', image: '🥕' },
    { id: 5, name: 'Bell Peppers', price: 150, seller: 'ColorfulVeggies', image: '🫑' },
    { id: 6, name: 'Cucumbers', price: 90, seller: 'CrunchyFarm', image: '🥒' },
    { id: 7, name: 'Spinach', price: 70, seller: 'LeafyGreens', image: '🥬' },
    { id: 8, name: 'Eggplant', price: 110, seller: 'PurpleVeggies', image: '🍆' },
    { id: 9, name: 'Cauliflower', price: 140, seller: 'WhiteVeggies', image: '🥦' },
    { id: 10, name: 'Broccoli', price: 160, seller: 'GreenPower', image: '🥦' },
    { id: 11, name: 'Garlic', price: 200, seller: 'SpicyRoots', image: '🧄' },
    { id: 12, name: 'Ginger', price: 180, seller: 'RootPower', image: '🫚' }
];

let cartCount = 0;
let currentPage = 1;
const productsPerPage = 8;
let filteredProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserSession();
    loadProductsFromAPI();
    setupEventListeners();
    setupPullToRefresh();
});

// Pull to refresh functionality
function setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const pullThreshold = 80;
    const main = document.querySelector('main');
    
    // Create refresh indicator
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'refresh-indicator';
    refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Pull to refresh';
    refreshIndicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b6b;
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-weight: bold;
        z-index: 1000;
        transition: transform 0.3s;
        display: none;
    `;
    document.body.appendChild(refreshIndicator);
    
    // Touch events for pull to refresh
    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
            refreshIndicator.style.transform = `translateX(-50%) translateY(${Math.min(pullDistance, pullThreshold)}px)`;
            refreshIndicator.style.display = 'block';
            
            if (pullDistance > pullThreshold) {
                refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Release to refresh';
            } else {
                refreshIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Pull to refresh';
            }
            
            e.preventDefault();
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (!isPulling) return;
        
        const pullDistance = currentY - startY;
        
        if (pullDistance > pullThreshold) {
            // Trigger refresh
            refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
            refreshIndicator.style.transform = 'translateX(-50%) translateY(20px)';
            
            // Refresh data
            loadProductsFromAPI().then(() => {
                setTimeout(() => {
                    refreshIndicator.style.display = 'none';
                    refreshIndicator.style.transform = 'translateX(-50%) translateY(-60px)';
                }, 1000);
            });
        } else {
            // Reset indicator
            refreshIndicator.style.display = 'none';
            refreshIndicator.style.transform = 'translateX(-50%) translateY(-60px)';
        }
        
        isPulling = false;
        startY = 0;
        currentY = 0;
    });
}

// Load products from API
async function loadProductsFromAPI() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const apiProducts = await response.json();
            if (apiProducts.length > 0) {
                products = apiProducts;
            }
        }
    } catch (error) {
        console.log('Using fallback data:', error);
    }
    filteredProducts = [...products];
    loadProducts();
    setupPagination();
}

// Load products grid with pagination
function loadProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">PKR ${product.price.toLocaleString()}</div>
                <span class="seller-tag">${product.seller}</span>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.seller.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
        currentPage = 1;
        loadProducts();
        setupPagination();
    });

    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        showLoginModal();
    });

    // Register button
    document.getElementById('registerBtn').addEventListener('click', () => {
        showRegisterModal();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });

    // Modal event listeners
    document.getElementById('closeLoginModal').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'none';
    });

    document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('loginModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Swipe gestures for pagination
    setupSwipeGestures();
}

// Authentication functions
let currentUser = null;
let authToken = null;

function showLoginModal() {
    document.getElementById('modalTitle').textContent = 'Login';
    document.getElementById('authSubmitBtn').textContent = 'Login';
    document.getElementById('nameGroup').style.display = 'none';
    document.getElementById('phoneGroup').style.display = 'none';
    document.getElementById('roleGroup').style.display = 'none';
    document.getElementById('addressGroup').style.display = 'none';
    document.getElementById('authToggle').innerHTML = 'Don\'t have an account? <a href="#" id="toggleAuthMode">Register here</a>';
    document.getElementById('loginModal').style.display = 'block';

    // Clear form
    document.getElementById('authForm').reset();
    document.getElementById('authMessage').textContent = '';

    // Setup toggle
    document.getElementById('toggleAuthMode').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });
}

function showRegisterModal() {
    document.getElementById('modalTitle').textContent = 'Register';
    document.getElementById('authSubmitBtn').textContent = 'Register';
    document.getElementById('nameGroup').style.display = 'block';
    document.getElementById('phoneGroup').style.display = 'block';
    document.getElementById('roleGroup').style.display = 'block';
    document.getElementById('addressGroup').style.display = 'block';
    document.getElementById('authToggle').innerHTML = 'Already have an account? <a href="#" id="toggleAuthMode">Login here</a>';
    document.getElementById('loginModal').style.display = 'block';

    // Clear form
    document.getElementById('authForm').reset();
    document.getElementById('authMessage').textContent = '';

    // Setup toggle
    document.getElementById('toggleAuthMode').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });
}

async function handleAuthSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isLogin = document.getElementById('modalTitle').textContent === 'Login';

    try {
        let response;
        if (isLogin) {
            response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } else {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const role = document.getElementById('role').value;
            const address = document.getElementById('address').value;

            response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, role, address })
            });
        }

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            document.getElementById('loginModal').style.display = 'none';
            updateUIForAuth();
            showAuthMessage(data.message, 'success');
        } else {
            showAuthMessage(data.error, 'error');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showAuthMessage('Network error. Please try again.', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateUIForAuth();
    showAuthMessage('Logged out successfully', 'success');
}

function updateUIForAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userInfo.style.display = 'inline';
        logoutBtn.style.display = 'inline';

        userInfo.textContent = `Welcome, ${currentUser.name} (${currentUser.role})`;
    } else {
        loginBtn.style.display = 'inline';
        registerBtn.style.display = 'none';
        userInfo.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Load user session on page load
function loadUserSession() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateUIForAuth();
    }
}

// Swipe gestures for pagination
function setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    const minSwipeDistance = 50;
    
    const productsGrid = document.getElementById('productsGrid');
    
    productsGrid.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    productsGrid.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Check if it's a horizontal swipe (more horizontal than vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - previous page
                if (currentPage > 1) {
                    changePage(currentPage - 1);
                }
            } else {
                // Swipe left - next page
                const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
                if (currentPage < totalPages) {
                    changePage(currentPage + 1);
                }
            }
        }
    });
}

// Setup pagination
function setupPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<button onclick="changePage(1)">First</button>';
    
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    paginationHTML += '<button onclick="changePage(' + totalPages + ')">Last</button>';
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadProducts();
    setupPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Product modal
function openProductModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('modalBody').innerHTML = `
        <img src="https://via.placeholder.com/400x300?text=${product.name}" alt="${product.name}" style="width:100%; border-radius:10px;">
        <h2>${product.name}</h2>
        <p><strong>Price:</strong> PKR ${product.price.toLocaleString()}</p>
        <p><strong>Seller:</strong> ${product.seller}</p>
        <p>${product.description || `${product.name} - Best quality product from trusted seller!`}</p>
    `;
    document.getElementById('productModal').style.display = 'block';
}

// Close modal
document.querySelector('.close').onclick = function() {
    document.getElementById('productModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Buy button
document.getElementById('buyBtn').onclick = async function() {
    cartCount++;
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('productModal').style.display = 'none';
    
    // Create order
    const orderData = {
        customerName: 'John Doe', // In real app, get from user input
        customerPhone: '+923001234567',
        customerAddress: 'Islamabad, Pakistan',
        items: [{ productId: 1, quantity: 1 }] // Simplified
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const order = await response.json();
            
            // Assign a random rider
            const availableRiders = [1, 2, 3, 4, 5, 6, 7, 8]; // All rider IDs
            const randomRiderId = availableRiders[Math.floor(Math.random() * availableRiders.length)];
            
            const assignResponse = await fetch(`/api/orders/${order.id}/assign-rider`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ riderId: randomRiderId })
            });
            
            if (assignResponse.ok) {
                // Store order ID in localStorage for tracking page
                localStorage.setItem('lastOrderId', order.id);
                alert('Order placed successfully! Redirecting to tracking...');
                window.location.href = 'tracking.html';
            }
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order');
    }
}