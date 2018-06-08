module.exports = {
  WebRecipeImporter: class WebRecipeImporter {
    constructor(selector) {
      const setPropertyArray = [
        'setNameProperty',
        'setCategoryProperty',
        'setServingsProperty',
        'setIngredientsProperty',
        'setInstructionsProperty',
        'setNotesProperty'
      ];
      setPropertyArray.forEach(functionName => {
        if (this[functionName] === undefined) {
          throw new Error(`${functionName} must be defined in subclass`);
        }
      });
      this.selector = selector;
    }
    buildNewRecipe(emptyRecipe, url) {
      this.setName();
      this.setCategory();
      this.setNumberOfServings();
      this.setIngredients();
      this.setInstructions();
      this.setNotes();
      this.setRecipeSource(url);
      emptyRecipe.name = this.name;
      emptyRecipe.category = this.category;
      emptyRecipe.ingredients = this.ingredients;
      emptyRecipe.numberOfServings = this.numberOfServings;
      emptyRecipe.instructions = this.instructions;
      emptyRecipe.notes = this.notes;
      return emptyRecipe;
    }
    setName() {
      this.setNameProperty();
      console.log(this.name);
      if (this.name.length < 1) {
        throw new Error(`no recipe name found for selector ${selectorString}`);
      }
    }
    setCategory() {
      this.setCategoryProperty();
      console.log(this.category);
      // no error handling necessary for optional category property
    }
    setNumberOfServings() {
      this.setServingsProperty();
      console.log(this.numberOfServings);
      // no error handling necessary for optional servings property
    }
    setIngredients() {
      this.setIngredientsProperty();
      console.log(this.ingredients);
      if (this.ingredients.length < 1) {
        throw new Error(`no ingredients found for selector ${selectorString}`);
      }
    }
    setInstructions() {
      this.setInstructionsProperty();
      console.log(this.instructions);
      if (this.instructions.length < 1) {
        throw new Error(`no instructions found for selector ${selectorString}`);
      }
    }
    setNotes() {
      this.setNotesProperty();
      console.log(this.notes);
      // no error handling necessary for optional notes property
    }
    setRecipeSource(url) {
      // automatically adds source URL to recipe notes
      this.notes = this.notes + `\nRecipe imported from ${url}`;
      console.log(this.notes);
    }
  }
};
