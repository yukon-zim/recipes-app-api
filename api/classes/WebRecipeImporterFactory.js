const AllRecipesImporter = require('./AllRecipesImporter.js').AllRecipesImporter;
const Food52Importer = require('./Food52Importer').Food52Importer;
const TheKitchnImporter = require('./TheKitchnImporter').TheKitchnImporter;
const URLLib = require('url');

module.exports = {
  getWebRecipeImporter(url, selector) {
    const recipeSource = new URLLib.parse(url);
    const hostName = recipeSource.hostname.toLowerCase();
    if (hostName.indexOf('allrecipes.com') > -1) {
      return new AllRecipesImporter(selector);
    }
    if (hostName.indexOf('food52.com') > -1) {
      return new Food52Importer(selector);
    }
    if (hostName.indexOf('thekitchn.com') > -1) {
      return new TheKitchnImporter(selector);
    }
    return new AllRecipesImporter(selector);
  }
};
