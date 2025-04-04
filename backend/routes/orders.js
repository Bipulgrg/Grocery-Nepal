const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const axios = require('axios');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (for admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('recipe')
      .populate('ingredients.ingredient')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (for admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'out_for_delivery', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('recipe')
      .populate('ingredients.ingredient');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generic payment verification callback
router.get('/payment-callback/:id', async (req, res) => {
  try {
    const { status } = req.query;
    
    if (status === 'success') {
      // Update the order status
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: 'confirmed' },
        { new: true }
      );
      
      return res.redirect(`/payment/success`);
    } else {
      return res.redirect(`/payment/failed`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return res.redirect('/payment/failed');
  }
});

// Update order (for payment status)
router.put('/:id', async (req, res) => {
  try {
    const { status, paymentDetails } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        paymentDetails: paymentDetails || {} 
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router; 