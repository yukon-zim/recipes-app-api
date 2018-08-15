// test/integration/api/controllers/RecipesController.test.js
const supertest = require('supertest');
const chai = require('chai');
const lodash = require('lodash');

const expect = chai.expect;


describe('RecipesController', () => {

  describe('getRecipes()', () => {
    it('should return an array of recipes if no search term is provided', done => {
      supertest(sails.hooks.http.app)
        .get('/recipes')
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.have.lengthOf(2);
          done();
        });
    });
    it('should return an array of recipes if a valid search term is provided', done => {
      supertest(sails.hooks.http.app)
        .get('/recipes?searchTerm=test')
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.have.lengthOf(1);
          done();
        });
    });
    it('should return an empty array if a non-matching search term is provided', done => {
      supertest(sails.hooks.http.app)
        .get('/recipes?searchTerm=sausage')
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.have.lengthOf(0);
          done();
        });
    });
  });
  describe('addRecipe()', () => {
    it('should save and return the new recipe', done => {
      const newRecipe = {
        name: 'test addRecipe()',
        category: 'test category',
        numberOfServings: 'test servings',
        ingredients: ['test ingredients'],
        instructions: ['test instructions'],
        notes: 'test notes'
      };
      supertest(sails.hooks.http.app)
        .post('/recipes')
        .send(newRecipe)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          const responseRecipe = lodash.omit(res.body, ['id', 'dateCreated', 'dateModified']);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('dateCreated');
          expect(res.body).to.have.property('dateModified');
          expect(responseRecipe).to.deep.equal(newRecipe);
          done();
        });
    });
    it('should throw an error on saving an invalid recipe', done => {
      const noNameRecipe = {
        name: '',
        category: 'test category',
        numberOfServings: 'test servings',
        ingredients: ['test ingredients'],
        instructions: ['test instructions'],
        notes: 'test notes'
      };
      supertest(sails.hooks.http.app)
        .post('/recipes')
        .send(noNameRecipe)
        .expect(400)
        .end((err, res) => {
          expect(res.body).to.have.property('code').that.equals('E_INVALID_NEW_RECORD');
          done();
        });
    });
  });
});
