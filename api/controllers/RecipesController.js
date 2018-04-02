/**
 * RecipesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fastCsv = require('fast-csv');
const idParamValidator = {'id': 'numeric'};
const errorHelper = require('../helpers/Error.js');
const fs = require('fs');

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
      foundRecipe.dateModified = new Date();
      foundRecipe.notes = req.body.notes;
      try {
        await foundRecipe.save();
        return res.send(foundRecipe);
      } catch(err) {
        const returnError = errorHelper.buildErrorResponse(err);
        return res.status(400).send(returnError);
      }
    }
  },
  async addRecipe(req, res) {
    const newRecipe = new Recipe();
    newRecipe.name = req.body.name;
    newRecipe.category = req.body.category;
    newRecipe.ingredients = req.body.ingredients;
    newRecipe.numberOfServings = req.body.numberOfServings;
    newRecipe.instructions = req.body.instructions;
    newRecipe.notes = req.body.notes;
    try {
      await newRecipe.save();
      return res.send(newRecipe);
    } catch(err) {
      const returnError = errorHelper.buildErrorResponse(err);
      return res.status(400).send(returnError);
    }
  },
  async deleteRecipe(req, res) {
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
      try {
        await foundRecipe.remove();
        return res.send({message: `Successfully removed recipe for ID ${id}`});
      } catch(err) {
        const returnError = errorHelper.buildErrorResponse(err);
        return res.status(400).send(returnError);
      }
    }
  },
  async importRecipe(req, res) {
    const readStream = req.file('importedRecipes');
    readStream.upload((err, uploadedFiles) => {
      const stream = fs.createReadStream(uploadedFiles[0].fd);
      const transformStream = fastCsv()
        .on('data', data => {
          const newRecipe = new Recipe();
          newRecipe.name = data[0];
          newRecipe.category = data[1];
          newRecipe.ingredients = data[2].split('\u001d');
          newRecipe.numberOfServings = data[3];
          newRecipe.instructions = data[4].split('\u000b');
          newRecipe.dateCreated = new Date(data[5]);
          newRecipe.dateModified = new Date();
          newRecipe.notes = data[7];
          newRecipe.save();
        })
        .on('end', () => {
          res.send({message: 'ok'});
        });
      stream.pipe(transformStream);
    });
  }
};


