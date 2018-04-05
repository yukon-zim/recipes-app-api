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
      }});
    newSchema.plugin(mongooseAutoIncrement.plugin, {model: 'Recipe', field: 'id'});
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
      required: true
    },
    category: {
      type: String,
      default:''
    },
    ingredients: {
      type: [String],
      required: true
    },
    numberOfServings: {
      type: String,
      default:''
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
  }
};
