const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const partnerRoutes = require('./routes/partners');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/partners', partnerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'O Jaga - Art & Craft Store' });
});

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`\n  🎨 O Jaga - Art & Craft Store`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  🌐 Server running at: http://localhost:${PORT}`);
  console.log(`  📦 API available at:   http://localhost:${PORT}/api`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
