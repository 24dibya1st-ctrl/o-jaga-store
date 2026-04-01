const express = require('express');
const router = express.Router();

// In-memory store for artist applications
const applications = [];

// POST /api/partners — Submit artist application
router.post('/', (req, res) => {
  const { name, email, phone, artStyle, portfolio } = req.body;

  if (!name || !email || !phone || !artStyle) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields (name, email, phone, art style)'
    });
  }

  const application = {
    id: 'ART-' + Date.now().toString(36).toUpperCase(),
    name,
    email,
    phone,
    artStyle,
    portfolio: portfolio || '',
    status: 'pending',
    appliedAt: new Date().toISOString()
  };

  applications.push(application);

  console.log(`\n  🎨 New Artist Application!`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  👤 Name:     ${application.name}`);
  console.log(`  📧 Email:    ${application.email}`);
  console.log(`  📞 Phone:    ${application.phone}`);
  console.log(`  🖌️  Art:      ${application.artStyle}`);
  console.log(`  🔖 ID:       ${application.id}`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully! Saswati & Dibya will review your work and contact you soon.',
    application: {
      id: application.id,
      name: application.name,
      status: application.status
    }
  });
});

// GET /api/partners — List all applications (admin use)
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: applications.length,
    applications: applications.map(a => ({
      id: a.id,
      name: a.name,
      artStyle: a.artStyle,
      status: a.status,
      appliedAt: a.appliedAt
    }))
  });
});

module.exports = router;
