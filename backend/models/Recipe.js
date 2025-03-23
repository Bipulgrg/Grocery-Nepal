const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, required: true },
  time: { type: String, required: true },
  image: { type: String, required: true }
});

module.exports = mongoose.model('Recipe', RecipeSchema); 