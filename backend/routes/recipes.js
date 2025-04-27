const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { upload } = require('../config/cloudinary');
const { auth, isAdmin } = require('../middleware/auth');

// Search recipes (move this before the :id route)
router.get('/search', async (req, res) => {
  try {
    const { query, category } = req.query;
    let filter = { name: { $regex: query, $options: 'i' } };
    
    if (category) {
      filter.category = { $regex: "^" + category + "$", $options: 'i' };
    }
    
    const recipes = await Recipe.find(filter).populate('ingredients.ingredient');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const { query, category } = req.query;
    let filter = {};

    if (query && category) {
      filter = {
        name: { $regex: query, $options: 'i' },
        category: { $regex: "^" + category + "$", $options: 'i' }
      };
    } else if (query) {
      filter = { name: { $regex: query, $options: 'i' } };
    } else if (category) {
      filter = { category: { $regex: "^" + category + "$", $options: 'i' } };
    }

    const recipes = await Recipe.find(filter).populate('ingredients.ingredient');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
});

// Add new recipe (admin only)
router.post('/', auth, isAdmin, async (req, res, next) => {
  try {
    // Handle image upload separately
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Multer/Cloudinary error:', err);
        return res.status(400).json({ message: 'Error uploading image', error: err.message });
      }

      try {
        console.log('Received request body:', req.body);
        console.log('Received file:', req.file);

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
            parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
          } catch (err) {
            console.error('Error parsing ingredients:', err);
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

        console.log('Creating recipe:', recipe);

        const savedRecipe = await recipe.save();
        const populatedRecipe = await Recipe.findById(savedRecipe._id).populate('ingredients.ingredient');
        res.status(201).json(populatedRecipe);
      } catch (error) {
        console.error('Error creating recipe:', error);
        if (error.name === 'ValidationError') {
          return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
      }
    });
  } catch (error) {
    console.error('Outer error:', error);
    next(error);
  }
});

// Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
});

// Update a recipe
router.put('/:id', async (req, res) => {
  try {
    const { name, category, difficulty, time, description, ingredients } = req.body;
    
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        difficulty,
        time,
        description,
        ingredients: ingredients.map(item => ({
          ingredient: item.ingredient,
          quantity: item.quantity
        }))
      },
      { new: true }
    ).populate('ingredients.ingredient');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
});

module.exports = router; 