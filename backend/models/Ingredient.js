const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true }, // unit for price (per kg, per piece, etc.)
  stock: { type: Number, required: true },
  stockUnit: { type: String, required: true } // unit for stock quantity
});

module.exports = mongoose.model('Ingredient', IngredientSchema); 