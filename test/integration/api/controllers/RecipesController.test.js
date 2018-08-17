// test/integration/api/controllers/RecipesController.test.js
const supertest = require('supertest');
const chai = require('chai');
const lodash = require('lodash');
const fixtures = require('../../../data/fixtures.js');


const expect = chai.expect;


describe('RecipesController', () => {
  // reset fixture data after each test
  afterEach(done => {
    fixtures.resetFixtureData()
      .then(() => {
        done();
      });
  });

  describe('getRecipes()', () => {
    it('should return an array of recipes if no search term is provided', async () => {
      const res = await supertest(sails.hooks.http.app)
        .get('/recipes')
        .expect(200);
      expect(res.body).to.have.lengthOf(2);
    });
    it('should return an array of recipes if a valid search term is provided', async () => {
      const res = await supertest(sails.hooks.http.app)
        .get('/recipes?searchTerm=test')
        .expect(200);
      expect(res.body).to.have.lengthOf(1);
    });
    it('should return an empty array if a non-matching search term is provided', async () => {
      const res = await supertest(sails.hooks.http.app)
        .get('/recipes?searchTerm=sausage')
        .expect(200);
      expect(res.body).to.have.lengthOf(0);
    });
  });
  describe('getRecipe()', () => {
    it('should throw an error if the expected recipe cannot be found', async () => {
      const invalidRecipeId = 5000000;
      const res = await supertest(sails.hooks.http.app)
        .get(`/recipes/${invalidRecipeId}`)
        .expect(404);
      expect(res.text).to.equal(`Recipe for ID ${invalidRecipeId} not found.`);
    });
    it('should throw an error if an invalid recipe ID is provided', async() => {
      const invalidRecipeId = 'string value';
      const res = await supertest(sails.hooks.http.app)
        .get(`/recipes/${invalidRecipeId}`)
        .expect(400);
      expect(res.body).to.equal(`id: ${invalidRecipeId}, has to be numeric type.`);
    });
    it('successfully retrieves a recipe if a valid recipe ID is provided', async () => {
      const validRecipeId = fixtures.getExistingRecipeIds()[0];
      const validRecipe = fixtures.getExistingRecipes()[0];
      const res = await supertest(sails.hooks.http.app)
        .get(`/recipes/${validRecipeId}`)
        .expect(200);
      expect(res.body).to.have.property('id').that.equals(validRecipe.id);
      expect(res.body).to.have.property('category').that.equals(validRecipe.category);
      expect(res.body).to.have.property('numberOfServings').that.equals(validRecipe.numberOfServings);
    });
  });
  describe('addRecipe()', () => {
    it('should save and return the new recipe', async () => {
      const newRecipe = {
        name: 'test addRecipe()',
        category: 'test category',
        numberOfServings: 'test servings',
        ingredients: ['test ingredients'],
        instructions: ['test instructions'],
        notes: 'test notes'
      };
      const res = await supertest(sails.hooks.http.app)
        .post('/recipes')
        .send(newRecipe)
        .expect(200);
      const responseRecipe = lodash.omit(res.body, ['id', 'dateCreated', 'dateModified']);
      expect(responseRecipe).to.deep.equal(newRecipe);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('dateCreated');
      expect(res.body).to.have.property('dateModified');
    });
    it('should throw an error on saving an invalid recipe', async () => {
      const noNameRecipe = {
        name: '',
        category: 'test category',
        numberOfServings: 'test servings',
        ingredients: ['test ingredients'],
        instructions: ['test instructions'],
        notes: 'test notes'
      };
      const res = await supertest(sails.hooks.http.app)
        .post('/recipes')
        .send(noNameRecipe)
        .expect(400);
      expect(res.body).to.have.property('code').that.equals('E_INVALID_NEW_RECORD');
    });
  });
  describe('updateRecipe()', () => {
    const validRecipe = {
      name: 'test updateRecipe()',
      category: 'test category',
      numberOfServings: 'test servings',
      ingredients: ['test ingredients'],
      instructions: ['test instructions'],
      notes: 'test notes'
    };
    const invalidRecipe = {
      name: '',
      category: 'test category',
      numberOfServings: 'test servings',
      ingredients: ['test ingredients'],
      instructions: ['test instructions'],
      notes: 'test notes'
    };
    it('should throw an error if the expected recipe cannot be found', async () => {
      const invalidRecipeId = 5000000;
      const res = await supertest(sails.hooks.http.app)
        .put(`/recipes/${invalidRecipeId}`)
        .send(validRecipe)
        .expect(404);
      expect(res.text).to.equal(`Recipe for ID ${invalidRecipeId} not found.`);
    });
    it('should throw an error if an invalid recipe ID is provided', async() => {
      const invalidRecipeId = 'string value';
      const res = await supertest(sails.hooks.http.app)
        .put(`/recipes/${invalidRecipeId}`)
        .send(validRecipe)
        .expect(400);
      expect(res.body).to.equal(`id: ${invalidRecipeId}, has to be numeric type.`);
    });
    it('should throw an error on saving an invalid recipe', async () => {
      const validRecipeId = fixtures.getExistingRecipeIds()[0];
      const res = await supertest(sails.hooks.http.app)
        .put(`/recipes/${validRecipeId}`)
        .send(invalidRecipe)
        .expect(400);
      expect(res.body).to.have.property('code').that.equals('E_INVALID_VALUES_TO_SET');
    });
    it('successfully updates on saving a valid recipe', async () => {
      const validRecipeId = fixtures.getExistingRecipeIds()[0];
      const res = await supertest(sails.hooks.http.app)
        .put(`/recipes/${validRecipeId}`)
        .send(validRecipe)
        .expect(200);
      const responseRecipe = lodash.omit(res.body, ['id', 'dateCreated', 'dateModified']);
      expect(responseRecipe).to.deep.equal(validRecipe);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('dateCreated');
      expect(res.body).to.have.property('dateModified');
    });
  });
  describe('deleteRecipe()', () => {
    it('should throw an error if the expected recipe cannot be found', async () => {
      const invalidRecipeId = 5000000;
      const res = await supertest(sails.hooks.http.app)
        .delete(`/recipes/${invalidRecipeId}`)
        .expect(404);
      expect(res.text).to.equal(`Recipe for ID ${invalidRecipeId} not found.`);
    });
    it('should throw an error if an invalid recipe ID is provided', async() => {
      const invalidRecipeId = 'string value';
      const res = await supertest(sails.hooks.http.app)
        .delete(`/recipes/${invalidRecipeId}`)
        .expect(400);
      expect(res.body).to.equal(`id: ${invalidRecipeId}, has to be numeric type.`);
    });
    it('successfully deletes a recipe if a valid recipe ID is provided', async () => {
      const validRecipeId = fixtures.getExistingRecipeIds()[0];
      const res = await supertest(sails.hooks.http.app)
        .delete(`/recipes/${validRecipeId}`)
        .expect(200);
      expect(res.body).to.have.property('message').that.equals(`Successfully removed recipe for ID ${validRecipeId}`);
    });
  });
});
