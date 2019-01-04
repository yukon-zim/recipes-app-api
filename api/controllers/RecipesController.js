/**
 * RecipesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fastCsv = require('fast-csv');
const idParamValidator = {'id': 'numeric'};
const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const cheerio = require('cheerio');
const WebRecipeImporterFactory = require('../classes/WebRecipeImporterFactory.js');
const requestOptions = {
  transform(body) {
    return cheerio.load(body);
  }
};

module.exports = {
  async getRecipes(req, res) {
    let recipes;
    const searchTerm = req.query.searchTerm;
    const searchProjection = {score:{$meta:'textScore'}};
    if (searchTerm) {
      recipes = await Recipe.find({$text:{$search:searchTerm}}, searchProjection).sort(searchProjection);
    } else {
      recipes = await Recipe.find({});
    }
    return res.send(recipes);
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
    const foundRecipe = await Recipe.getFullRecipe(id);
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
    const foundRecipe = await Recipe.getFullRecipe(id);
    if (!foundRecipe) {
      res.status(404).send(`Recipe for ID ${id} not found.`);
    } else {
      try {
        const updatedRecipe = await foundRecipe.updateRecipe(id, req.body);
        return res.send(updatedRecipe);
      } catch(err) {
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    }
  },
  async addRecipe(req, res) {
    const newRecipe = new Recipe();
    newRecipe.name =  req.body.name;
    newRecipe.category =  req.body.category;
    newRecipe.numberOfServings =  req.body.numberOfServings;
    newRecipe.ingredients =  req.body.ingredients;
    newRecipe.instructions =  req.body.instructions;
    newRecipe.notes =  req.body.notes;
    try {
      const savedRecipe = await Recipe.createNewRecipe(newRecipe);
      return res.send(savedRecipe);
    } catch(err) {
      const returnError = sails.helpers.error(err);
      return res.status(400).send(returnError);
    }
  },
  async addRecipeFromUrl(req, res) {
    let newRecipe = new Recipe();
    requestOptions.uri = req.body.url;
    const selector = await request(requestOptions);
    const webRecipeImporter = WebRecipeImporterFactory.getWebRecipeImporter(requestOptions.uri, selector);
    try {
      newRecipe = webRecipeImporter.buildNewRecipe(newRecipe, requestOptions.uri);
      await newRecipe.save();
      return res.send(newRecipe);
    } catch(err) {
      const returnError = sails.helpers.error(err);
      return res.status(400).send(returnError.message);
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
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    }
  },
  async importRecipe(req, res) {
    const readStream = req.file('importedRecipes');
    readStream.upload(async (err, uploadedFiles) => {
      if (err) {
        const returnError = sails.helpers.error(err, null);
        return res.status(400).send(returnError);
      }
      if (uploadedFiles.length === 0) {
        const returnError = sails.helpers.error(null, 'No files retrieved from import request');
        return res.status(400).send(returnError);
      }
      const filePath = uploadedFiles[0].fd;
      const fileExtension = (path.extname(filePath)).toLowerCase();
      if (fileExtension !== '.csv') {
        const returnError = sails.helpers.error(null, 'File must be a CSV');
        return res.status(400).send(returnError);
      }
      const stream = fs.createReadStream(filePath);
      let savedRecipeCount = 0;
      let totalRecipeCount = 0;
      const transformStream = fastCsv()
        .validate(data => {
          totalRecipeCount += 1;
          return true;
        })
        .on('data', data => {
          const newRecipe = new Recipe();
          newRecipe.name = data[0];
          newRecipe.category = data[1];
          newRecipe.ingredients = data[2].split('\u001d');
          newRecipe.numberOfServings = data[3];
          newRecipe.instructions = data[4].split('\u000b');
          if (data[5]) {
            newRecipe.dateCreated = new Date(data[5]);
          }
          newRecipe.notes = data[7];
          newRecipe.save(() => {
            savedRecipeCount += 1;
            if (savedRecipeCount === totalRecipeCount) {
              res.send({message: `imported ${savedRecipeCount} recipes`});
            }
          });
        })
        .on('error', err => {
          const returnError = sails.helpers.error(null, 'Encountered an error when importing recipes');
          return res.status(400).send(returnError);
        });
      stream.pipe(transformStream);
    });
  }
};


