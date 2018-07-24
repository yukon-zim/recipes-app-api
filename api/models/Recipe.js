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
      required: true,
      // disallow strings only of spaces to maintain UI access to recipe
      custom: function(name) {
        if (name.trim().length === 0) {
          return false;
        }
        return true;
      }
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
      columnType: 'varchar(1100)',
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
  async getFullRecipes(criteriaObj) {
    return await Recipe.find(criteriaObj)
      .populate('ingredients', {sort: 'ingredientIndex'})
      .populate('instructions', {sort: 'instructionIndex'});
  },
  async searchRecipes(searchString) {
    const wildCardSearch = `%${searchString}%`;
    const searchResults = await Recipe.getDatastore().sendNativeQuery(
      'SELECT DISTINCT recipe.recipe_id ' +
      'FROM recipes_app.recipe AS recipe ' +
      'INNER JOIN recipes_app.ingredient AS ingredient ' +
      'ON recipe.recipe_id = ingredient.recipe_id ' +
      'INNER JOIN recipes_app.instruction AS instruction ' +
      'ON recipe.recipe_id = instruction.recipe_id ' +
      'WHERE recipes_app.recipe.name LIKE $1 ' +
      'OR recipe.category LIKE $1 ' +
      'OR recipe.number_of_servings LIKE $1 ' +
      'OR recipe.date_created LIKE $1 ' +
      'OR recipe.date_modified LIKE $1 ' +
      'OR recipe.notes LIKE $1 ' +
      'OR ingredient.ingredient_name LIKE $1 ' +
      'OR instruction.instruction_name LIKE $1; ',
      [wildCardSearch]);
    console.log(searchResults);
    const recipeIds = searchResults.rows.map(row => {
      return row.recipe_id;
    });
    return await Recipe.getFullRecipes({id: {in: recipeIds}});
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
