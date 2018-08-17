// test/integration/api/controllers/RecipesController.test.js
const supertest = require('supertest');
const chai = require('chai');
const lodash = require('lodash');

const expect = chai.expect;


describe('RecipesController', () => {

  describe('getRecipes()', () => {
    it('should return an array of recipes if no search term is provided', async () => {
      await supertest(sails.hooks.http.app)
        .get('/recipes')
        .expect(200);
      expect(res.body).to.have.lengthOf(2);
    });
    it('should return an array of recipes if a valid search term is provided', async () => {
      await supertest(sails.hooks.http.app)
        .get('/recipes?searchTerm=test')
        .expect(200);
      expect(res.body).to.have.lengthOf(1);
    });
    it('should return an empty array if a non-matching search term is provided', async () => {
      await supertest(sails.hooks.http.app)
        .get('/recipes?searchTerm=sausage')
        .expect(200);
      expect(res.body).to.have.lengthOf(0);
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
      await supertest(sails.hooks.http.app)
        .post('/recipes')
        .send(newRecipe)
        .expect(200);
      const responseRecipe = lodash.omit(res.body, ['id', 'dateCreated', 'dateModified']);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('dateCreated');
      expect(res.body).to.have.property('dateModified');
      expect(responseRecipe).to.deep.equal(newRecipe);
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
      await supertest(sails.hooks.http.app)
        .post('/recipes')
        .send(noNameRecipe)
        .expect(400);
      expect(res.body).to.have.property('code').that.equals('E_INVALID_NEW_RECORD');
    });
  });
});
