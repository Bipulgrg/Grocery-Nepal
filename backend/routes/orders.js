const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

// Create a new order (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Request user:', req.user); // Debug log
    console.log('Request body:', req.body); // Debug log

    // Get userId from request body or auth middleware
    const userId = req.body.userId || req.user.userId || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const orderData = {
      ...req.body,
      userId: userId
    };
    
    console.log('Creating order with data:', orderData); // Debug log
    
    const order = new Order(orderData);
    await order.save();
    
    // Populate necessary fields before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate('recipe')
      .populate('ingredients.ingredient')
      .populate('userId', 'name email');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/admin', auth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('recipe')
      .populate('ingredients.ingredient')
      .populate('userId', 'name email') // Populate user details
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders (requires authentication)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('recipe')
      .populate('ingredients.ingredient')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'out_for_delivery', 'delivered', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order by ID (admin or order owner only)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('recipe')
      .populate('ingredients.ingredient')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (!req.user.isAdmin && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
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
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, paymentDetails } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (!req.user.isAdmin && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    order.status = status;
    order.paymentDetails = paymentDetails || {};
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get monthly sales data (admin only)
router.get('/admin/monthly-sales', auth, isAdmin, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Aggregate orders by month for the current year
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: 'delivered',  // Only count completed orders
          createdAt: {
            $gte: new Date(currentYear, 0, 1),  // Start of current year
            $lte: new Date(currentYear, 11, 31) // End of current year
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Transform data to include all months (even those with no sales)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySales.find(item => item._id === i + 1);
      return {
        month: i + 1,
        totalSales: monthData ? monthData.totalSales : 0,
        count: monthData ? monthData.count : 0
      };
    });

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;