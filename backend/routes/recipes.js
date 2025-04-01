const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { upload } = require('../config/cloudinary');

// Search recipes (move this before the :id route)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const recipes = await Recipe.find({
      name: { $regex: query, $options: 'i' }
    }).populate('ingredients.ingredient');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const { query, category } = req.query;
    let filter = {};

    if (query && category) {
      filter = {
        name: { $regex: query, $options: 'i' },
        category: category
      };
    } else if (query) {
      filter = { name: { $regex: query, $options: 'i' } };
    } else if (category) {
      filter = { category: category };
    }

    const recipes = await Recipe.find(filter).populate('ingredients.ingredient');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

// Get single recipe by ID (place this after /search but before generic routes)
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('ingredients.ingredient');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found - Invalid ID format' });
    }
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

// Add new recipe
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, difficulty, time, description, ingredients } = req.body;

    // Check if all fields are provided
    if (!name || !category || !difficulty || !time || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if image is provided
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Parse ingredients if provided
    let parsedIngredients = [];
    if (ingredients) {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid ingredients format' });
      }
    }

    const recipe = new Recipe({
      name,
      category,
      difficulty,
      time,
      description,
      image: req.file.path,
      ingredients: parsedIngredients
    });

    const savedRecipe = await recipe.save();
    const populatedRecipe = await Recipe.findById(savedRecipe._id).populate('ingredients.ingredient');
    res.status(201).json(populatedRecipe);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error creating recipe' });
  }
});

module.exports = router; 