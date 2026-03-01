const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { EsewaInitiatePayment, paymentStatus } = require('./controllers/esewa.controller');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Don't exit in serverless - let requests fail gracefully
  }
};

connectDB();

// Health check (no DB required)
app.get('/', (req, res) => res.json({ ok: true, message: 'Backend is running' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', profileRoutes);

// Esewa payment routes
app.post('/initiate-payment', EsewaInitiatePayment);
app.post('/payment-status', paymentStatus);

module.exports = app;

