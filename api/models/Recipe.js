const lodash = require('lodash');
const mongooseAutoIncrement = require('mongoose-auto-increment');

module.exports = {
  constructSchema(schemaDefinition, sails) {
    sails.mongoose.set('debug', true);
    mongooseAutoIncrement.initialize(sails.mongoose.connection);
    const newSchema = sails.mongoose.Schema(schemaDefinition);
    newSchema.index({
      name: 'text',
      category: 'text',
      ingredients: 'text',
      notes: 'text'
    }, {
      weights: {
        name: 10,
        category: 4,
        ingredients: 8,
        notes: 2
      }
    });
    newSchema.plugin(mongooseAutoIncrement.plugin, {model: 'Recipe', field: 'id'});
    newSchema.static('getFullRecipe', async (recipeId) => {
      return await Recipe.findOne({id: recipeId});
    });
    newSchema.methods.updateRecipe = async function(id, body) {
      this.name = body.name;
      this.category = body.category;
      this.ingredients = body.ingredients;
      this.numberOfServings = body.numberOfServings;
      this.instructions = body.instructions;
      this.dateModified = new Date();
      this.notes = body.notes;
      try {
        await this.save();
        return await Recipe.getFullRecipe(id);
      } catch (err) {
        return sails.helpers.error(err);
      }
    };
    newSchema.static('createNewRecipe', async function(recipe) {
      try {
        return await recipe.save();
      } catch(err) {
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    });
    return newSchema;
  },
  schema: {
    id: {
      type: Number,
      unique: true,
      required: true
    },
    name: {
      type: String,
      unique: true,
      required: true,
      // disallow strings only of spaces to maintain UI access to recipe
      custom: function (name) {
        if (name.trim().length === 0) {
          return false;
        }
        return true;
      }
    },
    category: {
      type: String,
      default: ''
    },
    ingredients: {
      type: [String],
      required: true
    },
    numberOfServings: {
      type: String,
      default: ''
    },
    instructions: {
      type: [String],
      required: true
    },
    dateCreated: {
      type: Date,
      required: true,
      default: new Date()
    },
    dateModified: {
      type: Date,
      required: true,
      default: new Date()
    },
    notes: {
      type: String,
      default:''
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
      'FROM recipe AS recipe ' +
      'INNER JOIN ingredient AS ingredient ' +
      'ON recipe.recipe_id = ingredient.recipe_id ' +
      'INNER JOIN instruction AS instruction ' +
      'ON recipe.recipe_id = instruction.recipe_id ' +
      'WHERE recipe.name LIKE $1 ' +
      'OR recipe.category LIKE $1 ' +
      'OR recipe.number_of_servings LIKE $1 ' +
      'OR recipe.date_created LIKE $1 ' +
      'OR recipe.date_modified LIKE $1 ' +
      'OR recipe.notes LIKE $1 ' +
      'OR ingredient.ingredient_name LIKE $1 ' +
      'OR instruction.instruction_name LIKE $1; ',
      [wildCardSearch]);
    const recipeIds = searchResults.rows.map(row => {
      return row.recipe_id;
    });
    return await Recipe.getFullRecipes({id: {in: recipeIds}});
  },
  // async createNewRecipe(recipeData) {
  //   const flatRecipeData = lodash.omit(recipeData, ['ingredients', 'instructions']);
  //   const newRecipe = await Recipe.create(flatRecipeData).fetch();
  //   const dbIngredients = recipeData.ingredients.map((ingredient, index) => {
  //     return {
  //       name: ingredient,
  //       ingredientIndex: index,
  //       recipeId: newRecipe.id
  //     };
  //   });
  //   await Ingredient.createEach(dbIngredients);
  //   const dbInstructions = recipeData.instructions.map((instruction, index) => {
  //     return {
  //       name: instruction,
  //       instructionIndex: index,
  //       recipeId: newRecipe.id
  //     };
  //   });
  //   await Instruction.createEach(dbInstructions);
  //   return await Recipe.getFullRecipe(newRecipe.id);
  // },
  // async updateRecipe(recipeData, recipeId) {
  //   const flatRecipeData = lodash.omit(recipeData, ['ingredients', 'instructions']);
  //   await Ingredient.destroy({recipeId});
  //   await Instruction.destroy({recipeId});
  //   const dbIngredients = recipeData.ingredients.map((ingredient, index) => {
  //     return {
  //       name: ingredient,
  //       ingredientIndex: index,
  //       recipeId: recipeId
  //     };
  //   });
  //   await Ingredient.createEach(dbIngredients);
  //   const dbInstructions = recipeData.instructions.map((instruction, index) => {
  //     return {
  //       name: instruction,
  //       instructionIndex: index,
  //       recipeId: recipeId
  //     };
  //   });
  //   await Instruction.createEach(dbInstructions);
  //   await Recipe.update({id: recipeId})
  //     .set(flatRecipeData);
  //   return await Recipe.getFullRecipe(recipeId);
  // },
  async deleteRecipe(recipeId) {
    await Ingredient.destroy({recipeId});
    await Instruction.destroy({recipeId});
    await Recipe.destroy({id: recipeId});
  }
};
