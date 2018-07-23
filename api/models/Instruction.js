module.exports = {
  attributes: {
    id: {
      columnName: 'instruction_id',
      type: 'Number',
      unique: true,
      autoIncrement: true
    },
    name: {
      columnName: 'instruction_name',
      type: 'String',
      required: true,
      columnType: 'varchar(1500)'
    },
    instructionIndex: {
      columnName: 'instruction_index',
      type: 'Number',
      required: true
    },
    recipeId: {
      columnName: 'recipe_id',
      model: 'recipe',
      required: true
    }
  }
};
