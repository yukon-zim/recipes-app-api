module.exports = {
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
