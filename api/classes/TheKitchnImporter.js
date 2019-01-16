const WebRecipeImporter = require('./WebRecipeImporter.js').WebRecipeImporter;

module.exports = {
  TheKitchnImporter: class TheKitchnImporter extends WebRecipeImporter {
    constructor(selector) {
      super(selector);
    }
    setNameProperty() {
      const selectorString = '[itemprop=name]';
      this.name = this.selector(selectorString).last().text();
    }
    setCategoryProperty() {
      this.category = '';
    }
    setServingsProperty() {
      const selectorString = '[itemprop=recipeYield]';
      this.numberOfServings = this.selector(selectorString).first().text().split('\n').join('').trim();
    }
    setIngredientsProperty() {
      const selectorString = '.Recipe__ingredients';
      this.ingredients = this.selector(selectorString).children()
        .map((index, elem) => {
          return this.selector(elem).text().split('\n').join('').trim();
        }).get();
    }
    setInstructionsProperty() {
      const selectorString = '.Recipe__instructions';
      this.instructions = this.selector(selectorString).map((index, elem) => {
        return this.selector(elem).children().map((innerIndex, innerElem) => {
          return this.selector(innerElem).text().split('\n').join('').trim();
        }).get();
      }).get();
    }
    setNotesProperty() {
      const selectorString = `h3:contains('Recipe Notes')`;
      this.notes = this.selector(selectorString).nextAll().text();
    }
  }
};
