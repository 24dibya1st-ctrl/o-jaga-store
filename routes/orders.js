const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const products = require('../data/products');
const cartModule = require('./cart');

// In-memory orders storage
const orders = [];

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
  const { name, email, phone, address, city, pincode, paymentMethod = 'cod' } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !address || !city || !pincode) {
    return res.status(400).json({
      success: false,
      message: 'All delivery details are required'
    });
  }

  const cart = cartModule.getCart();
  if (cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Build order items with product details
  const orderItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = subtotal > 999 ? 0 : 99;

  const order = {
    id: uuidv4().split('-')[0].toUpperCase(),
    items: orderItems,
    customer: { name, email, phone, address, city, pincode },
    paymentMethod,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  cartModule.clearCart();

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order
  });
});

// GET /api/orders - Get all orders
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: orders.length,
    orders: orders.reverse()
  });
});

// GET /api/orders/:id - Get single order
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

module.exports = router;
