const lodash = require('lodash');

module.exports = {
  attributes: {
    id: {
      columnName: 'recipe_id',
      type: 'Number',
      unique: true,
      autoIncrement: true
    },
    name: {
      type: 'String',
      unique: true,
      required: true
    },
    category: {
      type: 'String',
      defaultsTo: ''
    },
    ingredients: {
      collection: 'ingredient',
      via: 'recipeId'
    },
    numberOfServings: {
      columnName: 'number_of_servings',
      type: 'String',
      defaultsTo: ''
    },
    instructions: {
      collection: 'instruction',
      via: 'recipeId'
    },
    dateCreated: {
      columnName: 'date_created',
      type: 'ref',
      columnType: 'Date',
      defaultsTo: new Date()
    },
    dateModified: {
      columnName: 'date_modified',
      type: 'ref',
      columnType: 'Date',
      defaultsTo: new Date()
    },
    notes: {
      type: 'String',
      defaultsTo: ''
    },
  },
  cascadeOnDestroy: true,
  customToJSON() {
    const newRecipe = lodash.omit(this, ['ingredients', 'instructions']);
    const ingredientNames = this.ingredients.map(ingredient => {
      return ingredient.name;
    });
    const instructionNames = this.instructions.map(instruction => {
      return instruction.name;
    });
    newRecipe.ingredients = ingredientNames;
    newRecipe.instructions = instructionNames;
    return newRecipe;
  },
  async getFullRecipe(recipeId) {
    return await Recipe.findOne({id: recipeId})
      .populate('ingredients', {sort: 'ingredientIndex'})
      .populate('instructions', {sort: 'instructionIndex'});
  },
  async createNewRecipe(recipeData) {
    const flatRecipeData = lodash.omit(recipeData, ['ingredients', 'instructions']);
    const newRecipe = await Recipe.create(flatRecipeData).fetch();
    const dbIngredients = recipeData.ingredients.map((ingredient, index) => {
      return {
        name: ingredient,
        ingredientIndex: index,
        recipeId: newRecipe.id
      };
    });
    await Ingredient.createEach(dbIngredients);
    const dbInstructions = recipeData.instructions.map((instruction, index) => {
      return {
        name: instruction,
        instructionIndex: index,
        recipeId: newRecipe.id
      };
    });
    await Instruction.createEach(dbInstructions);
    return await Recipe.getFullRecipe(newRecipe.id);
  },
  async deleteRecipe(recipeId) {
    await Ingredient.destroy({recipeId});
    await Instruction.destroy({recipeId});
    await Recipe.destroy({id: recipeId});
  }
};
