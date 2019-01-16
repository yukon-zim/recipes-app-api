const WebRecipeImporter = require('./WebRecipeImporter.js').WebRecipeImporter;

module.exports = {
  Food52Importer: class Food52Importer extends WebRecipeImporter {
    constructor(selector) {
      super(selector);
      this.recipeText = JSON.parse(this.selector('script[type="application/ld+json"]').html());
    }
    setNameProperty() {
      this.name = this.recipeText.name;
    }
    setCategoryProperty() {
      this.category = this.recipeText.recipeCategory;
    }
    setServingsProperty() {
      this.numberOfServings = this.recipeText.recipeYield;
    }
    setIngredientsProperty() {
      this.ingredients = this.recipeText.recipeIngredient;
    }
    setInstructionsProperty() {
      this.instructions = this.recipeText.recipeInstructions.split('\n');
    }
    setNotesProperty() {
      this.notes = this.recipeText.description;
    }
  }
};
