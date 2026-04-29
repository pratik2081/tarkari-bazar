// Seller dashboard functionality
let sellerProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserSession();
    loadSellerProducts();
    setupSellerEventListeners();
    updateDashboardStats();
});

// Load seller's products
async function loadSellerProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const allProducts = await response.json();
            // Filter products by current seller (in real app, use user authentication)
            sellerProducts = allProducts.filter(p => p.seller === 'You');
        }
    } catch (error) {
        console.log('Error loading products:', error);
    }
    
    displaySellerProducts();
    updateDashboardStats();
}

// Display seller's products
function displaySellerProducts() {
    const grid = document.getElementById('myProducts');
    if (sellerProducts.length === 0) {
        grid.innerHTML = '<p>No products listed yet. Add your first product above!</p>';
        return;
    }
    
    grid.innerHTML = sellerProducts.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">PKR ${product.price.toLocaleString()}</div>
                <span class="seller-tag">${product.seller}</span>
            </div>
            <div class="product-actions">
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupSellerEventListeners() {
    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', addProduct);

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
}

// Add new product
async function addProduct(e) {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const desc = document.getElementById('productDesc').value.trim();
    
    if (!name || !price || price <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const newProduct = {
        name,
        price,
        seller: 'You',
        image: '🆕',
        description: desc
    };
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        
        if (response.ok) {
            const addedProduct = await response.json();
            sellerProducts.unshift(addedProduct);
            displaySellerProducts();
            updateDashboardStats();
            e.target.reset();
            alert('Product listed successfully!');
        } else {
            const error = await response.json();
            alert('Failed to add product: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
    }
}

// Edit product (placeholder)
function editProduct(id) {
    alert('Edit functionality - Coming soon!');
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        // Note: Our API doesn't have DELETE endpoint, so we'll just remove from local array
        sellerProducts = sellerProducts.filter(p => p.id !== id);
        displaySellerProducts();
        updateDashboardStats();
        alert('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product.');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('totalProducts').textContent = sellerProducts.length;
    
    const totalSales = sellerProducts.reduce((sum, product) => sum + product.price, 0);
    document.getElementById('totalSales').textContent = `PKR ${totalSales.toLocaleString()}`;
    
    // Mock orders today (in real app, fetch from orders API)
    document.getElementById('ordersToday').textContent = Math.floor(Math.random() * 10);
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