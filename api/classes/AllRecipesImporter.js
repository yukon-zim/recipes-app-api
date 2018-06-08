const WebRecipeImporter = require('./WebRecipeImporter.js').WebRecipeImporter;

module.exports = {
  AllRecipesImporter: class AllRecipesImporter extends WebRecipeImporter {
    constructor(selector) {
      super(selector);
    }
    setNameProperty() {
      const selectorString = '[itemprop=name]';
      this.name = this.selector(selectorString).last().text();
    }
    setCategoryProperty() {
      const selectorString = '[itemprop=recipeCategory]';
      this.category = this.selector(selectorString).map((index, elem) => {
        return this.selector(elem).attr('content');
      }).get().join('; ');
    }
    setServingsProperty() {
      const selectorString = '[itemprop=recipeYield]';
      this.numberOfServings = this.selector(selectorString).attr('content');
    }
    setIngredientsProperty() {
      const selectorString = '[itemprop=ingredients]';
      this.ingredients = this.selector(selectorString).map((index, elem) => {
        return this.selector(elem).text();
      }).get();
    }
    setInstructionsProperty() {
      const selectorString = '[itemprop=recipeInstructions]';
      this.instructions = this.selector(selectorString).children().map((index, elem) => {
        return this.selector(elem).text().split('\n').join('').trim();
      }).get();
    }
    setNotesProperty() {
      const selectorString = '.recipe-footnotes';
      this.notes = this.selector(selectorString).text();
    }
  }
};
