# Mobile-Responsive PWA Vegetable Market

A fully responsive Progressive Web App for a vegetable market with touch-friendly design, swipe gestures, pull-to-refresh, and PWA capabilities.

## 🚀 Features

### Mobile Optimizations
- **Touch-Friendly Design**: All interactive elements are at least 44px for easy tapping
- **Swipe Gestures**: Swipe left/right on product pages for navigation
- **Pull-to-Refresh**: Pull down on shop page to refresh products
- **Safe Areas**: Support for iPhone X+ notches and modern device bezels
- **No Zoom on Inputs**: Prevents unwanted zoom when focusing form inputs
- **Full-Screen Modals**: Mobile-optimized modal dialogs

### PWA Features
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker caches static assets
- **Fast Loading**: Optimized CSS and JavaScript for quick rendering
- **App-like Experience**: Native app feel with smooth animations

### Multi-Page Structure
- **Shop Page** (`index.html`): Product browsing with search and cart
- **Seller Dashboard** (`seller.html`): Product management for sellers
- **Order Tracking** (`tracking.html`): Live order tracking with Google Maps

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Express.js with REST API
- **PWA**: Service Worker, Web App Manifest
- **Mobile**: Touch events, viewport optimization, safe areas

## 📱 Mobile Testing

### Testing PWA Installation
1. Open the website on a mobile browser (Chrome/Safari)
2. Look for "Add to Home Screen" prompt
3. Or use browser menu to install as PWA

### Testing Touch Features
- **Buttons**: All buttons should be easy to tap (44px minimum)
- **Swipe**: On shop page, swipe left/right to navigate products
- **Pull-to-Refresh**: Pull down from top of shop page to refresh
- **Forms**: Input fields shouldn't cause zoom on iOS

### Testing Performance
- **Fast Loading**: CSS optimized for above-the-fold rendering
- **Smooth Scrolling**: GPU-accelerated animations
- **Offline**: Try loading when offline (cached resources)

## 🚀 Running the Application

### Prerequisites
- Node.js (v16+ recommended)

### Installation
```bash
# Install dependencies
npm install express cors

# Start the server
node server.js
```

### Access
- Open `http://localhost:3000` in your browser
- Test on mobile devices for best experience

## 📂 Project Structure

```
project.1/
├── index.html          # Shop page
├── seller.html         # Seller dashboard
├── tracking.html       # Order tracking
├── style.css           # Mobile-responsive styles
├── shop.js             # Shop functionality + touch gestures
├── seller.js           # Seller dashboard logic
├── tracking.js         # Order tracking logic
├── server.js           # Express backend
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── README.md          # This file
```

## 🎨 CSS Optimizations

- **GPU Acceleration**: `transform: translateZ(0)` for smooth animations
- **Touch Actions**: `touch-action: manipulation` for better touch response
- **Safe Areas**: CSS `env()` functions for modern devices
- **Dynamic Viewport**: `100dvh` for proper mobile height
- **Optimized Rendering**: Critical CSS above the fold

## 🔧 JavaScript Features

### Touch Gestures
- **Swipe Detection**: Threshold-based swipe recognition
- **Pull-to-Refresh**: Visual feedback with loading spinner
- **Touch Prevention**: Prevents unwanted behaviors

### PWA Integration
- **Service Worker**: Automatic registration and caching
- **Manifest**: Proper app metadata for installation
- **Offline Detection**: Graceful offline handling

## � Authentication System

The app includes a complete user authentication system with role-based access:

### User Roles
- **Customer**: Can browse products, place orders, track deliveries
- **Seller**: Can add/manage products, view their sales
- **Driver**: Can view assigned deliveries, update order status

### Test Accounts
- **Customer**: `john@example.com` / `password123`
- **Seller**: `farms@greenvalley.com` / `password123`
- **Driver**: `ali@driver.com` / `password123`

### Features
- **Login/Register**: Modal-based authentication
- **Session Management**: JWT-like token system with localStorage
- **Role-based UI**: Different features based on user role
- **Protected Routes**: Backend validates authentication tokens
- **Persistent Sessions**: Users stay logged in across page reloads

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `GET /api/user/orders` - Get user's orders (role-based)
- `GET /api/user/products` - Get seller's products
- `GET /api/products` - Get all products (with pagination/search)
- `POST /api/products` - Add new product (seller only)
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/assign-rider` - Assign driver to order
- `GET /api/riders` - Get all drivers

## 🐛 Troubleshooting

### PWA Not Installing
- Ensure HTTPS in production (required for PWA)
- Check manifest.json syntax
- Verify service worker registration

### Touch Gestures Not Working
- Check browser compatibility (modern mobile browsers)
- Ensure touch events are not prevented by CSS
- Test on actual mobile devices

### Performance Issues
- Check network tab for large assets
- Verify service worker is caching properly
- Test on slower connections

## 📱 Browser Support

- **Mobile**: iOS Safari 12+, Chrome Mobile 70+, Samsung Internet 10+
- **Desktop**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

## 🔄 Future Enhancements

- [ ] Push notifications for order updates
- [ ] Offline order queuing
- [ ] Advanced caching strategies
- [ ] Haptic feedback for touch interactions
- [ ] Dark mode support</content>
<parameter name="filePath">c:\Users\bs pratik\OneDrive\Desktop\project\project.1\README.md