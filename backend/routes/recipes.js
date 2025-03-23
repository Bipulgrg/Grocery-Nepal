const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { upload } = require('../config/cloudinary');

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search recipes
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const recipes = await Recipe.find({
      name: { $regex: query, $options: 'i' }
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new recipe with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, difficulty, time } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Create new recipe with Cloudinary URL
    const newRecipe = new Recipe({
      name,
      difficulty,
      time,
      image: req.file.path // This will be the Cloudinary URL
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 