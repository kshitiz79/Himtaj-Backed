const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require("dotenv").config();

const uploadImage = require("./utils/uploadimage");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: "25mb" }));
app.use(bodyParser.json({ limit: "25mb" })); // Body parser for JSON
app.use(bodyParser.urlencoded({ limit: "25mb", extended: true })); // Body parser for URL-encoded data

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter); // Apply to all API routes

// Logging
app.use(morgan('combined'));

// Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const reviewRoutes = require('./src/reviews/reviews.route');
const statsRoutes = require('./src/stats/stats.route');
const cartRoutes = require('./src/cart/cart.route');
const dealRoutes = require('./src/deals/deals.route');
const couponRoutes = require('./src/coupon/coupon.route');
const orderRoutes = require('./src/orders/order.route');



app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/deal', dealRoutes);


app.use('/api/orders', orderRoutes);
app.use('/api/coupon', couponRoutes);




// Database connection
// Database connection
async function main() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Mongodb connected successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
main();


// Upload image route
app.post("/api/uploadImage", (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: "Image data is required" });
    }
    uploadImage(image)
        .then((response) => res.status(200).json(response))
        .catch((err) => res.status(500).json({ error: "Image upload failed", details: err }));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
