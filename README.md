# ✦ O Jaga — Art & Craft Store

A beautiful, full-stack art & craft e-commerce application built with Express.js and vanilla HTML/CSS/JS.

![O Jaga Store](https://img.shields.io/badge/O_Jaga-Art_%26_Craft_Store-C17446?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PC9zdmc+)

## 🌟 Features

- **12 Handcrafted Products** across 6 categories (Painting, Pottery, Textile, Paper Crafts, Home Décor, Craft Supplies)
- **Product Browsing** with search, category filters, and sorting
- **Product Detail Modal** with ratings and descriptions
- **Shopping Cart** — add, remove, update quantities via slide-in drawer
- **Checkout Flow** — delivery details form with payment method selection
- **Order Confirmation** with order ID and summary
- **Free Shipping** on orders above ₹999
- **Toast Notifications** for user actions
- **Responsive Design** — works on mobile, tablet, and desktop

## 🎨 Design

- **Dark theme** with warm terracotta (#C17446) and gold (#D4A853) accents
- **Glassmorphism** effects with backdrop blur
- **Micro-animations** — floating shapes, hover effects, page transitions
- **Google Fonts** — Outfit (headings) + Inter (body)
- **Design System**: "Artisan Noir" — crafted via Stitch

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML, CSS, JavaScript (SPA)
- **Data**: In-memory storage (no database required)
- **Dependencies**: express, cors, uuid

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/o-jaga-store.git
cd o-jaga-store

# Install dependencies
npm install

# Start the server
npm start
```

Open **http://localhost:3000** in your browser.

## 📁 Project Structure

```
o-jaga-store/
├── server.js              # Express server entry point
├── package.json           # Dependencies
├── data/
│   └── products.js        # Product catalog (12 items)
├── routes/
│   ├── products.js        # Product API routes
│   ├── cart.js            # Cart API routes
│   └── orders.js          # Order API routes
└── public/
    ├── index.html         # Single-page application
    ├── css/styles.css     # Complete design system
    └── js/app.js          # Application logic
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List products (search, filter, sort) |
| `/api/products/categories` | GET | Get all categories |
| `/api/products/:id` | GET | Single product details |
| `/api/cart` | GET | View cart contents |
| `/api/cart` | POST | Add item to cart |
| `/api/cart/:productId` | PUT | Update item quantity |
| `/api/cart/:productId` | DELETE | Remove item from cart |
| `/api/orders` | POST | Place an order |
| `/api/orders` | GET | List all orders |

## 🏷️ Product Categories

| Category | Products |
|----------|----------|
| 🎨 Painting & Drawing | Watercolor Paint Set, Artist Canvas Pack |
| 🏺 Pottery & Ceramics | Handmade Ceramic Vase, Clay Sculpting Kit |
| 🧶 Textile & Fiber | Macramé Wall Hanging, Embroidery Starter Kit |
| 📄 Paper Crafts | Origami Paper Collection, Handmade Leather Journal |
| 🏠 Home Décor | Resin Art Coaster Set, Hand-carved Wooden Frame |
| 🖌️ Craft Supplies | Premium Brush Set, Calligraphy Pen Set |

## 📍 About

**O Jaga** (ଓ ଜଗ) — meaning "O World" in Odia — is a tribute to the rich artisan heritage of Odisha, India. Based in Bhubaneswar, we connect local craftspeople with art lovers worldwide.

## 📄 License

MIT License — feel free to use this project for learning and inspiration.

---

*Made with ❤️ in Odisha, India*
