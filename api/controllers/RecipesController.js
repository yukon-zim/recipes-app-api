/**
 * RecipesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const idParamValidator = {'id': 'numeric'};

module.exports = {
  async getRecipes(req, res) {
    return res.send(await Recipe.find({}));
  },
  async getRecipe(req, res) {
    // validation
    const paramsValidated = req.validate(
      // if the validation fails, "req.badRequest" will be called
      idParamValidator
    );
    if (!paramsValidated) {
      return;
    }
    // convert ID from URL to number
    const id = +paramsValidated.id;
    // look up recipe
    const foundRecipe = await Recipe.findOne({id});
    if (!foundRecipe) {
      res.status(404).send(`Recipe for ID ${id} not found.`);
    } else {
      return res.send(foundRecipe);
    }
  },
  async updateRecipe(req, res) {
    // validation
    const paramsValidated = req.validate(
      // if the validation fails, "req.badRequest" will be called
      idParamValidator
    );
    if (!paramsValidated) {
      return;
    }
    // convert ID from URL to number
    const id = +paramsValidated.id;
    // look up recipe
    const foundRecipe = await Recipe.findOne({id});
    if (!foundRecipe) {
      res.status(404).send(`Recipe for ID ${id} not found.`);
    } else {
      foundRecipe.name = req.body.name;
      foundRecipe.category = req.body.category;
      foundRecipe.ingredients = req.body.ingredients;
      foundRecipe.numberOfServings = req.body.numberOfServings;
      foundRecipe.instructions = req.body.instructions;
      foundRecipe.dateCreated = req.body.dateCreated;
      foundRecipe.dateModified = req.body.dateModified;
      foundRecipe.notes = req.body.notes;
      await foundRecipe.save();
      return res.send(foundRecipe);
    }
  }
};

