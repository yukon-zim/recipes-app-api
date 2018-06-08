const AllRecipesImporter = require('./AllRecipesImporter.js').AllRecipesImporter;
const Food52Importer = require('./Food52Importer').Food52Importer;
const URLLib = require('url');

module.exports = {
  getWebRecipeImporter(url, selector) {
    const recipeSource = new URLLib.parse(url);
    const hostName = recipeSource.hostname.toLowerCase();
    switch (hostName) {
      case 'allrecipes.com':
        return new AllRecipesImporter(selector);
        break;
      case 'food52.com':
        return new Food52Importer(selector);
        break;
      default:
        return new AllRecipesImporter(selector);
    }
  }
};
