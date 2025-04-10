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

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(' MongoDB connection error:', err);
    process.exit(1); 
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/payment', require('./routes/transactionRoute'));

// Esewa payment routes
app.post("/initiate-payment", EsewaInitiatePayment);
app.post("/payment-status", paymentStatus);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
