const express = require('express');
const router = express.Router();
const products = require('../data/products');

// In-memory cart storage
let cart = [];

// GET /api/cart - Get cart contents
router.get('/', (req, res) => {
  const cartWithDetails = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  });

  const subtotal = cartWithDetails.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  res.json({
    success: true,
    items: cartWithDetails,
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shipping: subtotal > 999 ? 0 : 99,
    total: subtotal + (subtotal > 999 ? 0 : 99)
  });
});

// POST /api/cart - Add item to cart
router.post('/', (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  res.status(201).json({
    success: true,
    message: `${product.name} added to cart`,
    cart: cart
  });
});

// PUT /api/cart/:productId - Update item quantity
router.put('/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ success: false, message: 'Valid quantity is required' });
  }

  const itemIndex = cart.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  if (quantity === 0) {
    cart.splice(itemIndex, 1);
    return res.json({ success: true, message: 'Item removed from cart' });
  }

  cart[itemIndex].quantity = quantity;
  res.json({ success: true, message: 'Cart updated', item: cart[itemIndex] });
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', (req, res) => {
  const { productId } = req.params;
  const itemIndex = cart.findIndex(item => item.productId === productId);

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  cart.splice(itemIndex, 1);
  res.json({ success: true, message: 'Item removed from cart' });
});

// DELETE /api/cart - Clear entire cart
router.delete('/', (req, res) => {
  cart = [];
  res.json({ success: true, message: 'Cart cleared' });
});

// Export cart reference for orders
module.exports = router;
module.exports.getCart = () => cart;
module.exports.clearCart = () => { cart = []; };
