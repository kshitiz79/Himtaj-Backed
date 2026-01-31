const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const uploadImage = require('./utils/uploadimage');

const app = express();
const port = process.env.PORT || 4000;

// 🔐 Security headers
app.use(helmet());

// 🌍 CORS setup
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://himtajjewelry.com',
      'http://localhost:5173',
      'http://localhost:3000', // Next.js default port
      'http://localhost:3001', // Alternative Next.js port
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 📦 Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cookieParser());

// 🧱 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
});
app.use('/api/', limiter);

// 📝 Logging
app.use(morgan('combined'));

// 🛣️ Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const reviewRoutes = require('./src/reviews/reviews.route');
const statsRoutes = require('./src/stats/stats.route');
const cartRoutes = require('./src/cart/cart.route');
const dealRoutes = require('./src/deals/deals.route');
const couponRoutes = require('./src/coupon/coupon.route');
const orderRoutes = require('./src/orders/order.route');
const bannerRoutes = require('./src/banners/banners.route');
const heroRoutes = require('./src/heroes/heroes.route');

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/heroes', heroRoutes);

// 🖼️ Image Upload Endpoint
app.post('/api/uploadImage', (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  uploadImage(image)
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json({ error: 'Image upload failed', details: err }));
});

// 🌐 Root Route for health check
app.get('/', (req, res) => {
  res.send('Himtaj Jewelry API is running 🚀');
});

// 🧯 Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 🧠 DB Connection + Server Start
async function main() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongodb connected successfully!');

    // ✅ Start server only after DB is connected
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

main();

