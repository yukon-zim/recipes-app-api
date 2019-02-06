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
    newSchema.static('searchRecipes', async (searchTerm) => {
      const searchProjection = {score:{$meta:'textScore'}};
      return await Recipe.find({$text:{$search:searchTerm}}, searchProjection).sort(searchProjection);
    });
    newSchema.methods.updateRecipe = async function(id, body) {
      this.name = body.name;
      this.category = body.category;
      this.ingredients = body.ingredients;
      this.numberOfServings = body.numberOfServings;
      this.instructions = body.instructions;
      this.dateModified = new Date();
      this.notes = body.notes;
      await this.save();
      return await Recipe.getFullRecipe(id);
    };
    newSchema.static('createNewRecipe', async function(recipe) {
      return await recipe.save();
    });
    newSchema.methods.deleteRecipe = async function() {
      return await this.remove();
    };
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
      default: Date.now
    },
    dateModified: {
      type: Date,
      required: true,
      default: Date.now
    },
    notes: {
      type: String,
      default:''
    },
  },
  cascadeOnDestroy: true,
};
