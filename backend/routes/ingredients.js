const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredients' });
  }
});

// Add new ingredient
router.post('/', async (req, res) => {
  try {
    const { name, price, unit, stock, stockUnit } = req.body;

    if (!name || !price || !unit || stock === undefined || !stockUnit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ingredient = new Ingredient({
      name,
      price: Number(price),
      unit,
      stock: Number(stock),
      stockUnit
    });

    const savedIngredient = await ingredient.save();
    res.status(201).json(savedIngredient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ingredient' });
  }
});

module.exports = router; 