const mongoose = require('mongoose');

const RecipeIngredientSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true }
});

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: [RecipeIngredientSchema]
});

module.exports = mongoose.model('Recipe', RecipeSchema); 