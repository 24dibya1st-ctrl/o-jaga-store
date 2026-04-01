const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /api/products - Get all products with optional filtering
router.get('/', (req, res) => {
  let result = [...products];
  const { category, search, sort } = req.query;

  // Filter by category
  if (category && category !== 'All') {
    result = result.filter(p => p.category === category);
  }

  // Search by name or description
  if (search) {
    const query = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  // Sort
  if (sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    success: true,
    count: result.length,
    products: result
  });
});

// GET /api/products/categories - Get all categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ success: true, categories: ['All', ...categories] });
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

module.exports = router;
