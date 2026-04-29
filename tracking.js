// Order tracking functionality
let map;
let riderMarker;
let customerMarker;
let customerLocation = { lat: 33.6844, lng: 73.0479 }; // Default customer location
let riderLocation = { lat: 33.6890, lng: 73.0550 }; // Starting rider location

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserSession();
    setupTrackingEventListeners();
    
    // Auto-load last order if available
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) {
        document.getElementById('orderIdInput').value = lastOrderId;
        lookupOrder(lastOrderId);
    }
});

// Setup event listeners
function setupTrackingEventListeners() {
    // Lookup order button
    document.getElementById('lookupBtn').addEventListener('click', function() {
        const orderId = document.getElementById('orderIdInput').value.trim();
        if (orderId) {
            lookupOrder(orderId);
        } else {
            alert('Please enter an Order ID');
        }
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
}

// Lookup order by ID
async function lookupOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            displayOrderTracking(order);
        } else if (response.status === 404) {
            alert('Order not found. Please check the Order ID.');
        } else {
            alert('Error loading order details.');
        }
    } catch (error) {
        console.error('Error looking up order:', error);
        alert('Error connecting to server. Please try again.');
    }
}

// Display order tracking
function displayOrderTracking(order) {
    document.getElementById('trackingContainer').style.display = 'block';
    
    // Update order info
    document.getElementById('orderNumber').textContent = `Order #${order.id}`;
    document.getElementById('orderStatus').textContent = order.status.replace('_', ' ').toUpperCase();
    
    // Update rider info if assigned
    if (order.rider) {
        document.getElementById('riderAvatar').src = order.rider.photo || `https://via.placeholder.com/100x100?text=${order.rider.name.split(' ')[0]}`;
        document.getElementById('riderName').textContent = order.rider.name;
        document.getElementById('riderRating').innerHTML = `<i class="fas fa-star"></i> ${order.rider.rating}`;
        document.getElementById('riderExperience').textContent = `${order.rider.experience} experience`;
        document.getElementById('riderDeliveries').innerHTML = `<i class="fas fa-box"></i> ${order.rider.totalDeliveries.toLocaleString()} deliveries`;
        document.getElementById('riderPhone').href = `tel:${order.rider.phone}`;
        document.getElementById('riderPhone').textContent = order.rider.phone;
        document.getElementById('riderVehicle').textContent = order.rider.vehicle;
        document.getElementById('vehicleNumber').textContent = order.rider.vehicleNumber;
        
        // Update rider location
        riderLocation = order.rider.location || riderLocation;
        
        // Show rider info section
        document.querySelector('.rider-info').style.display = 'block';
    } else {
        // Hide rider info if no rider assigned
        document.querySelector('.rider-info').style.display = 'none';
    }
    
    // Initialize map
    initMap();
    
    // Start tracking simulation if order is active and has rider
    if (order.rider && ['pending', 'confirmed', 'rider_assigned', 'picked_up', 'on_the_way'].includes(order.status)) {
        simulateRiderTracking();
    } else if (order.status === 'delivered') {
        // Show rider at customer location if delivered
        if (order.rider) {
            riderMarker.setPosition(customerLocation);
            map.panTo(customerLocation);
        }
        document.getElementById('eta').textContent = 'Delivered';
    } else {
        // For orders without rider or in early stages
        document.getElementById('eta').textContent = 'Finding driver...';
    }
}

// Google Maps initialization
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 33.6844, lng: 73.0479 }, // Islamabad
        zoom: 14
    });
    
    // Customer marker
    customerMarker = new google.maps.Marker({
        position: customerLocation,
        map: map,
        title: 'Delivery Address',
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    });
    
    // Rider marker
    riderMarker = new google.maps.Marker({
        position: riderLocation,
        map: map,
        title: 'Rider Location',
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
    });
}

// Simulate rider tracking
function simulateRiderTracking() {
    let currentRiderLat = riderLocation.lat;
    let currentRiderLng = riderLocation.lng;
    let step = 0;
    const totalSteps = 50; // Number of steps to reach destination
    
    const interval = setInterval(() => {
        if (step >= totalSteps) {
            clearInterval(interval);
            document.getElementById('orderStatus').textContent = 'DELIVERED';
            document.getElementById('eta').textContent = '0 mins';
            return;
        }
        
        // Calculate direction towards customer
        const latDiff = customerLocation.lat - currentRiderLat;
        const lngDiff = customerLocation.lng - currentRiderLng;
        
        // Move a fraction towards the destination
        currentRiderLat += latDiff / totalSteps;
        currentRiderLng += lngDiff / totalSteps;
        
        const newPos = { lat: currentRiderLat, lng: currentRiderLng };
        riderMarker.setPosition(newPos);
        
        // Update map center to follow rider
        map.panTo(newPos);
        
        // Update ETA based on remaining distance
        const remainingSteps = totalSteps - step;
        const eta = Math.max(1, Math.floor(remainingSteps / 10)); // Roughly 1 min per 10 steps
        document.getElementById('eta').textContent = `${eta} mins`;
        
        // Update status based on progress
        const progress = step / totalSteps;
        let status;
        if (progress < 0.2) status = 'RIDER ASSIGNED';
        else if (progress < 0.4) status = 'PICKED UP';
        else if (progress < 0.7) status = 'ON THE WAY';
        else if (progress < 0.9) status = 'ARRIVING SOON';
        else status = 'DELIVERED';
        
        document.getElementById('orderStatus').textContent = status;
        
        step++;
    }, 3000);
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