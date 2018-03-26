const mongooseAutoIncrement = require('mongoose-auto-increment');

module.exports = {
  constructSchema(schemaDefinition, sails) {
    mongooseAutoIncrement.initialize(sails.mongoose.connection);
    const newSchema = sails.mongoose.Schema(schemaDefinition);
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
      required: true
    },
    category: {type: String},
    ingredients: {
      type: [String],
      required: true
    },
    numberOfServings: {type: String},
    instructions: {
      type: [String],
      required: true
    },
    dateCreated: {type: Date},
    dateModified: {type: Date},
    notes: {type: String},
  }
};
