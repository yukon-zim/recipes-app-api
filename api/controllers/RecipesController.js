/**
 * RecipesController
 *
 * @description :: Server-side actions for handling incoming recipe requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fastCsv = require('fast-csv');
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
    let recipes = [];
    const searchTerm = req.query.searchTerm;
    if (searchTerm) {
      recipes = await Recipe.searchRecipes(searchTerm);
    } else {
      recipes = await Recipe.getFullRecipes({});
    }
    return res.send(recipes);
  },
  async getRecipe(req, res) {
    // validation
    const id = sails.helpers.idValidator(req);
    // look up recipe
    const foundRecipe = await Recipe.getFullRecipe(id);
    if (!foundRecipe) {
      const returnError = sails.helpers.error(null, `Recipe for ID ${id} not found.`);
      return res.status(404).send(returnError);
    } else {
      return res.send(foundRecipe);
    }
  },
  async updateRecipe(req, res) {
    // validation
    const id = sails.helpers.idValidator(req);
    // look up recipe
    const foundRecipe = await Recipe.findOne({id});
    console.log(foundRecipe);
    if (!foundRecipe) {
      const returnError = sails.helpers.error(null, `Recipe for ID ${id} not found.`);
      res.status(404).send(returnError);
    } else {
      const updatedRecipeData = {
        name: req.body.name,
        category: req.body.category,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        numberOfServings: req.body.numberOfServings,
        notes: req.body.notes
      };
      console.log(updatedRecipeData);
      try {
        const updatedRecipe = await Recipe.updateRecipe(updatedRecipeData, id);
        return res.send(updatedRecipe);
      } catch(err) {
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    }
  },
  async addRecipe(req, res) {
    const newRecipe = {
      name: req.body.name,
      category: req.body.category,
      numberOfServings: req.body.numberOfServings,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      notes: req.body.notes
    };
    try {
      const savedRecipe = await Recipe.createNewRecipe(newRecipe);
      return res.send(savedRecipe);
    } catch(err) {
      const returnError = sails.helpers.error(err);
      return res.status(400).send(returnError);
    }
  },
  async addRecipeFromUrl(req, res) {
    let newRecipe = {};
    requestOptions.uri = req.body.url;
    const selector = await request(requestOptions);
    const webRecipeImporter = WebRecipeImporterFactory.getWebRecipeImporter(requestOptions.uri, selector);
    try {
      newRecipe = webRecipeImporter.buildNewRecipe(newRecipe, requestOptions.uri);
      const importedRecipe = await Recipe.createNewRecipe(newRecipe);
      return res.send(importedRecipe);
    } catch(err) {
      const returnError = sails.helpers.error(err);
      return res.status(400).send(returnError.message);
    }
  },
  async deleteRecipe(req, res) {
    // validation
    const id = sails.helpers.idValidator(req);
    // look up recipe
    const foundRecipe = await Recipe.findOne({id});
    if (!foundRecipe) {
      const returnError = sails.helpers.error(null, `Recipe for ID ${id} not found.`);
      res.status(404).send(returnError);
    } else {
      try {
        await Recipe.deleteRecipe(id);
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
      let erroredRecipeCount = 0;
      let totalRecipeCount = 0;
      const transformStream = fastCsv()
        .validate(() => {
          totalRecipeCount += 1;
          return true;
        })
        .on('data', data => {
          function sendResponseIfLastRecord(res) {
            if ((savedRecipeCount + erroredRecipeCount) === totalRecipeCount) {
              res.send({message: `imported ${savedRecipeCount} recipes,\\n encountered ${erroredRecipeCount} errors`});
            }
          }
          try {
            const newRecipeObj = {
              name: data[0],
              category: data[1],
              ingredients: data[2].split('\u001d'),
              numberOfServings: data[3],
              instructions: data[4].split('\u000b'),
              notes: data[7]
            };
            // if (data[5]) {
            //   newRecipe.dateCreated = new Date(data[5]);
            // }

            const importedRecipe = Recipe.createNewRecipe(newRecipeObj);
            importedRecipe.then(() => {
              savedRecipeCount += 1;
              sendResponseIfLastRecord(res);
            }).catch(err => {
              erroredRecipeCount += 1;
              sendResponseIfLastRecord(res);
              console.error(err);

            });
          } catch (err) {
            erroredRecipeCount += 1;
            sendResponseIfLastRecord(res);
            console.error(err);
          }
        })
        .on('error', () => {
          const returnError = sails.helpers.error(null, 'Encountered an error when importing recipes');
          return res.status(400).send(returnError);
        });
      stream.pipe(transformStream);
    });
  }
};


