const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Ingredient = require('../models/Ingredient');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../services/emailService');

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

    // Handle old schema format (convert to new format)
    if (req.body.recipe && !req.body.recipes) {
      console.log('Converting old schema format to new schema format');
      req.body.recipes = [{
        recipeId: req.body.recipe,
        ingredients: req.body.ingredients || [],
        servings: req.body.servings || 1,
        amount: req.body.totalAmount || 0
      }];
      
      // Delete old fields
      delete req.body.recipe;
      delete req.body.ingredients;
      delete req.body.servings;
    }
    
    const orderData = {
      ...req.body,
      userId: userId
    };
    
    console.log('Creating order with data:', orderData);

    // Update ingredient stock levels
    for (const recipe of orderData.recipes) {
      for (const ingredient of recipe.ingredients) {
        const ingredientDoc = await Ingredient.findById(ingredient.ingredient);
        if (!ingredientDoc) {
          return res.status(400).json({ message: `Ingredient ${ingredient.ingredient} not found` });
        }

        // Calculate total quantity needed (quantity per recipe * number of servings)
        const totalQuantity = ingredient.quantity * recipe.servings;

        // Check if enough stock is available
        if (ingredientDoc.stock < totalQuantity) {
          return res.status(400).json({ 
            message: `Not enough stock for ${ingredientDoc.name}. Available: ${ingredientDoc.stock} ${ingredientDoc.stockUnit}, Required: ${totalQuantity} ${ingredientDoc.stockUnit}`
          });
        }

        // Reduce stock
        ingredientDoc.stock -= totalQuantity;
        await ingredientDoc.save();
      }
    }
    
    const order = new Order(orderData);
    await order.save();
    
    // Populate necessary fields before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'recipes.recipeId',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'recipes.ingredients.ingredient',
        select: 'name price unit'
      })
      .populate('userId', 'name email');

    // Get user's email and send confirmation email
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        // Send order confirmation email
        await sendOrderConfirmationEmail(populatedOrder, user.email);
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
    }
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/admin', auth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching admin orders');
    const orders = await Order.find()
      .populate({
        path: 'recipes.recipeId',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'recipes.ingredients.ingredient',
        select: 'name price unit'
      })
      .populate('userId', 'name email') // Populate user details
      .sort({ createdAt: -1 });
    
    // Log the first order for debugging
    if (orders.length > 0) {
      console.log('First order structure:', JSON.stringify(orders[0], null, 2));
    } else {
      console.log('No orders found');
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders (requires authentication)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate({
        path: 'recipes.recipeId',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'recipes.ingredients.ingredient',
        select: 'name price unit'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching my orders:', error);
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
      .populate({
        path: 'recipes.recipeId',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'recipes.ingredients.ingredient',
        select: 'name price unit'
      })
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
    console.error('Error fetching order by ID:', error);
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

// Cancel order (user can cancel their own order)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the order owner
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    // Restore ingredient stock
    for (const recipe of order.recipes) {
      for (const ingredient of recipe.ingredients) {
        const ingredientDoc = await Ingredient.findById(ingredient.ingredient);
        if (ingredientDoc) {
          // Calculate total quantity to restore (quantity per recipe * number of servings)
          const totalQuantity = ingredient.quantity * recipe.servings;
          ingredientDoc.stock += totalQuantity;
          await ingredientDoc.save();
        }
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;