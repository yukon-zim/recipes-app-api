module.exports = {
  schema: {
    id: {type: Number},
    name: {type: String},
    category: {type: String},
    ingredients: {type: [String]},
    numberOfServings: {type: String},
    instructions: {type: [String]},
    dateCreated: {type: Date},
    dateModified: {type: Date},
    notes: {type: String},
  }
};
