const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Recipe = require('../models/Recipe');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;
    
    // Find or create a cart for the user
    let cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.recipe',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'items.selectedIngredients.ingredient',
        select: 'name price unit'
      });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { recipeId, quantity, selectedIngredients } = req.body;
    const userId = req.user.id;
    
    // Validate recipe existence
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Find or create a cart for the user
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    // Check if recipe is already in the cart
    const existingItemIndex = cart.items.findIndex(
      item => item.recipe.toString() === recipeId
    );
    
    if (existingItemIndex > -1) {
      // Update the existing item
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].selectedIngredients = selectedIngredients;
    } else {
      // Add new item to cart
      cart.items.push({
        recipe: recipeId,
        quantity,
        selectedIngredients
      });
    }
    
    // Save the cart
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.recipe',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'items.selectedIngredients.ingredient',
        select: 'name price unit'
      });
    
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, selectedIngredients } = req.body;
    const userId = req.user.id;
    
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Update the item
    if (quantity !== undefined) {
      cart.items[itemIndex].quantity = quantity;
    }
    
    if (selectedIngredients !== undefined) {
      cart.items[itemIndex].selectedIngredients = selectedIngredients;
    }
    
    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
    
    // Save the cart
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.recipe',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'items.selectedIngredients.ingredient',
        select: 'name price unit'
      });
    
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove the item
    cart.items.splice(itemIndex, 1);
    
    // Save the cart
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.recipe',
        select: 'name image price time difficulty category'
      })
      .populate({
        path: 'items.selectedIngredients.ingredient',
        select: 'name price unit'
      });
    
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Clear all items
    cart.items = [];
    
    // Save the cart
    await cart.save();
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Checkout cart - create a single order with multiple recipes
router.post('/checkout', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerName, address, phoneNumber, paymentMethod } = req.body;
    
    // Validate required fields
    if (!customerName || !address || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required delivery information' });
    }
    
    // Find the user's cart
    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.recipe',
        select: 'name image price'
      })
      .populate({
        path: 'items.selectedIngredients.ingredient',
        select: 'name price unit'
      });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total amount across all recipes
    let totalAmount = 0;
    
    // Create recipes array for the order
    const recipes = cart.items.map(cartItem => {
      // Calculate recipe amount
      const recipeAmount = cartItem.selectedIngredients.reduce((sum, item) => {
        return sum + (item.ingredient.price * item.quantity);
      }, 0) * cartItem.quantity;
      
      // Add to total
      totalAmount += recipeAmount;
      
      // Return recipe object for order
      return {
        recipeId: cartItem.recipe._id,
        ingredients: cartItem.selectedIngredients.map(item => ({
          ingredient: item.ingredient._id,
          quantity: item.quantity
        })),
        servings: cartItem.quantity,
        amount: recipeAmount
      };
    });
    
    // Create a single order with multiple recipes
    const orderData = {
      userId,
      customerName,
      address,
      phoneNumber,
      recipes: recipes,
      totalAmount: totalAmount,
      status: 'pending',
      paymentMethod
    };
    
    // Create and save the order
    const newOrder = new Order(orderData);
    const order = await newOrder.save();
    
    if (!order) {
      return res.status(400).json({ message: 'Failed to create order' });
    }
    
    // Clear the cart after successful order creation
    cart.items = [];
    await cart.save();

    // Get user's email
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        // Send order confirmation email
        await sendOrderConfirmationEmail(order, user.email);
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
    }
    
    res.status(201).json({ 
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error checking out cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
