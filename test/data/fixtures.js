module.exports = {
  async resetFixtureData() {
    await Ingredient.destroy({});
    await Instruction.destroy({});
    await Recipe.destroy({});
    const newRecipe = {
      name: 'test name',
      category: 'test category',
      numberOfServings: 'test servings',
      ingredients: ['test ingredients'],
      instructions: ['test instructions'],
      notes: 'test notes'
    };
    const newRecipe2 = {
      name: 'name',
      category: 'category',
      numberOfServings: 'servings',
      ingredients: ['ingredients'],
      instructions: ['instructions'],
      notes: 'notes'
    };
    this.existingRecipes = [await Recipe.createNewRecipe(newRecipe), await Recipe.createNewRecipe(newRecipe2)];
    this.existingRecipeIds = this.existingRecipes.map(recipe => {
      return recipe.id;
    });
  },
  getExistingRecipes () {
    return this.existingRecipes;
  },
  getExistingRecipeIds () {
    return this.existingRecipeIds;
  }
};
