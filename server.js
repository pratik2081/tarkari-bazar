// Node.js + Express backend
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// In-memory database (use MongoDB in production)
let products = [];
let orders = [];
let users = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123', // In production, hash passwords!
        phone: '+923001112233',
        role: 'customer',
        address: 'House 123, Street 45, Islamabad'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+923002223344',
        role: 'customer',
        address: 'Apartment 5B, Blue Area, Islamabad'
    },
    {
        id: 3,
        name: 'Green Valley Farms',
        email: 'farms@greenvalley.com',
        password: 'password123',
        phone: '+923003334455',
        role: 'seller',
        address: 'Farm Road, Islamabad'
    },
    {
        id: 4,
        name: 'Ali Khan',
        email: 'ali@driver.com',
        password: 'password123',
        phone: '+923001234567',
        role: 'driver',
        address: 'Sector G-9, Islamabad'
    }
];
let sessions = {}; // Simple session store (use Redis in production)

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const session = sessions[token];
    if (!session) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if session is expired (24 hours)
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
        delete sessions[token];
        return res.status(401).json({ error: 'Session expired' });
    }

    req.user = session.user;
    next();
}

// Generate simple token (use JWT in production)
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
let riders = [
    {
        id: 1,
        name: 'Ali Khan',
        phone: '+923001234567',
        rating: 4.8,
        vehicle: 'Honda CD70 Bike',
        vehicleNumber: 'RWP-1234',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        experience: '3 years',
        totalDeliveries: 1250,
        location: { lat: 33.6844, lng: 73.0479 }
    },
    {
        id: 2,
        name: 'Sara Ahmed',
        phone: '+923001234568',
        rating: 4.9,
        vehicle: 'Yamaha Scooty',
        vehicleNumber: 'ISB-5678',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        experience: '2 years',
        totalDeliveries: 980,
        location: { lat: 33.6890, lng: 73.0550 }
    },
    {
        id: 3,
        name: 'Ahmed Raza',
        phone: '+923001234569',
        rating: 4.7,
        vehicle: 'Suzuki GS150 Bike',
        vehicleNumber: 'RWP-9012',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        experience: '4 years',
        totalDeliveries: 2100,
        location: { lat: 33.6780, lng: 73.0400 }
    },
    {
        id: 4,
        name: 'Fatima Bibi',
        phone: '+923001234570',
        rating: 4.6,
        vehicle: 'Honda Scooty',
        vehicleNumber: 'ISB-3456',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        experience: '1.5 years',
        totalDeliveries: 650,
        location: { lat: 33.6920, lng: 73.0620 }
    },
    {
        id: 5,
        name: 'Muhammad Ali',
        phone: '+923001234571',
        rating: 4.8,
        vehicle: 'Yamaha YBR125',
        vehicleNumber: 'RWP-7890',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        experience: '3.5 years',
        totalDeliveries: 1580,
        location: { lat: 33.6750, lng: 73.0350 }
    },
    {
        id: 6,
        name: 'Ayesha Khan',
        phone: '+923001234572',
        rating: 4.9,
        vehicle: 'Honda Activa',
        vehicleNumber: 'ISB-1122',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        experience: '2.5 years',
        totalDeliveries: 890,
        location: { lat: 33.6950, lng: 73.0680 }
    },
    {
        id: 7,
        name: 'Hassan Malik',
        phone: '+923001234573',
        rating: 4.7,
        vehicle: 'Suzuki Raider',
        vehicleNumber: 'RWP-3344',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
        experience: '5 years',
        totalDeliveries: 3200,
        location: { lat: 33.6720, lng: 73.0300 }
    },
    {
        id: 8,
        name: 'Zara Iqbal',
        phone: '+923001234574',
        rating: 4.8,
        vehicle: 'Honda Dio',
        vehicleNumber: 'ISB-5566',
        photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        experience: '2 years',
        totalDeliveries: 720,
        location: { lat: 33.6980, lng: 73.0750 }
    }
];

// Sample orders for testing
orders = [
    {
        id: 1001,
        customerName: 'John Doe',
        customerPhone: '+923001112233',
        customerAddress: 'House 123, Street 45, Islamabad',
        items: [
            { productId: 1, name: 'Fresh Tomatoes', quantity: 2, price: 80 },
            { productId: 2, name: 'Organic Onions', quantity: 1, price: 60 }
        ],
        status: 'rider_assigned',
        riderId: 1,
        rider: riders.find(r => r.id === 1),
        createdAt: new Date().toISOString()
    },
    {
        id: 1002,
        customerName: 'Jane Smith',
        customerPhone: '+923002223344',
        customerAddress: 'Apartment 5B, Blue Area, Islamabad',
        items: [
            { productId: 3, name: 'Green Chillies', quantity: 3, price: 45 },
            { productId: 4, name: 'Fresh Potatoes', quantity: 5, price: 100 }
        ],
        status: 'on_the_way',
        riderId: 2,
        rider: riders.find(r => r.id === 2),
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    },
    {
        id: 1003,
        customerName: 'Ahmed Hassan',
        customerPhone: '+923003334455',
        customerAddress: 'Villa 78, DHA Phase 1, Islamabad',
        items: [
            { productId: 5, name: 'Organic Carrots', quantity: 2, price: 70 },
            { productId: 6, name: 'Fresh Spinach', quantity: 1, price: 40 }
        ],
        status: 'delivered',
        riderId: 3,
        rider: riders.find(r => r.id === 3),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    }
];

// Sample products for testing
products = [
    { id: 1, name: 'Fresh Tomatoes', price: 80, seller: 'Green Valley Farms', image: '🍅', description: 'Organic red tomatoes, 1kg pack' },
    { id: 2, name: 'Organic Onions', price: 60, seller: 'Farm Fresh Produce', image: '🧅', description: 'Red onions, pesticide-free, 1kg' },
    { id: 3, name: 'Green Chillies', price: 45, seller: 'Spicy Gardens', image: '🌶️', description: 'Fresh green chillies, 500g pack' },
    { id: 4, name: 'Fresh Potatoes', price: 100, seller: 'Mountain Harvest', image: '🥔', description: 'Premium quality potatoes, 2kg pack' },
    { id: 5, name: 'Organic Carrots', price: 70, seller: 'Root Vegetables Co', image: '🥕', description: 'Organic carrots, crunchy and sweet, 1kg' },
    { id: 6, name: 'Fresh Spinach', price: 40, seller: 'Leafy Greens Farm', image: '🥬', description: 'Fresh spinach leaves, 500g bundle' }
];

// Routes

// Authentication routes
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    const token = generateToken();
    sessions[token] = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
        },
        createdAt: Date.now()
    };

    res.json({
        token,
        user: sessions[token].user,
        message: 'Login successful'
    });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone, role, address } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['customer', 'seller', 'driver'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const user = {
        id: Date.now(),
        name,
        email,
        password, // In production, hash this!
        phone,
        role,
        address: address || ''
    };
    users.push(user);

    // Create session
    const token = generateToken();
    sessions[token] = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
        },
        createdAt: Date.now()
    };

    res.status(201).json({
        token,
        user: sessions[token].user,
        message: 'Registration successful'
    });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        delete sessions[token];
    }
    res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Protected routes (require authentication)
app.get('/api/user/orders', authenticateToken, (req, res) => {
    let userOrders;
    if (req.user.role === 'customer') {
        // Get orders by customer phone (since we don't have user_id in orders)
        userOrders = orders.filter(o => o.customerPhone === req.user.phone);
    } else if (req.user.role === 'driver') {
        // Get orders assigned to this driver
        userOrders = orders.filter(o => o.riderId === req.user.id);
    } else {
        userOrders = orders; // Sellers can see all orders
    }
    res.json(userOrders);
});

app.get('/api/user/products', authenticateToken, (req, res) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Only sellers can access this endpoint' });
    }

    // Get products by this seller
    const sellerProducts = products.filter(p => p.seller === req.user.name);
    res.json(sellerProducts);
});

app.get('/api/products', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search ? req.query.search.toLowerCase() : '';
    
    let filteredProducts = products;
    
    // Apply search filter
    if (search) {
        filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.seller.toLowerCase().includes(search) ||
            (p.description && p.description.toLowerCase().includes(search))
        );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
        products: paginatedProducts,
        total: filteredProducts.length,
        page,
        pages: Math.ceil(filteredProducts.length / limit)
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, seller, image, description } = req.body;
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Product name is required and must be a non-empty string' });
    }
    if (!price || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Product price must be a positive number' });
    }
    if (!seller || typeof seller !== 'string' || seller.trim().length === 0) {
        return res.status(400).json({ error: 'Seller name is required and must be a non-empty string' });
    }
    
    const product = { 
        id: Date.now(), 
        name: name.trim(), 
        price, 
        seller: seller.trim(), 
        image: image || '🆕',
        description: description ? description.trim() : ''
    };
    products.push(product);
    res.status(201).json(product);
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id == req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

app.post('/api/orders', (req, res) => {
    const { customerName, customerPhone, customerAddress, items } = req.body;
    
    // Validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
        return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!customerPhone || typeof customerPhone !== 'string' || !/^\+?[\d\s-()]+$/.test(customerPhone)) {
        return res.status(400).json({ error: 'Valid customer phone number is required' });
    }
    if (!customerAddress || typeof customerAddress !== 'string' || customerAddress.trim().length === 0) {
        return res.status(400).json({ error: 'Customer address is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    // Validate items
    for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
            return res.status(400).json({ error: 'Each item must have a valid productId and positive quantity' });
        }
    }
    
    const order = { 
        id: Date.now(), 
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'rider_assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = orders.find(o => o.id == id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    res.json(order);
});

app.put('/api/orders/:id/assign-rider', (req, res) => {
    const { id } = req.params;
    const { riderId } = req.body;
    
    const order = orders.find(o => o.id == id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    const rider = riders.find(r => r.id == riderId);
    if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
    }
    
    order.riderId = riderId;
    order.rider = rider;
    order.status = 'rider_assigned';
    res.json(order);
});

app.get('/api/riders', (req, res) => {
    res.json(riders);
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});