module.exports = {
  attributes: {
    id: {
      columnName: 'ingredient_id',
      type: 'Number',
      unique: true,
      autoIncrement: true
    },
    name: {
      columnName: 'ingredient_name',
      type: 'String',
      required: true
    },
    ingredientIndex: {
      columnName: 'ingredient_index',
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
