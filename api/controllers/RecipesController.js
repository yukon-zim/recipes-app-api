/**
 * RecipesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const recipes = [{
  id: 1,
  name: 'TEST and cheese omelet ala Bob',
  category: 'eggs',
  ingredients: [
    '6 eggs',
    '10 strips bacon (pre cooked)',
    '2 slices white American cheese',
    'oregano (optional)'
  ],
  numberOfServings: '2 or 3',
  instructions: [
    'Crack eggs into mixing bowl.',
    'Add milk and oregano.',
    'Beat well.',
    'Cut bacon into small pieces and heat - be careful not to overcook.',
    'Cut cheese into small pieces.',
    'When bacon is heated, pour eggs into pan.',
    'Immediately add cheese.',
    'Stir and flip until eggs are done as you like it'
  ],
  dateCreated: new Date('1/28/2001'),
  dateModified: new Date('1/6/2004'),
  notes: 'This is a test of the recipe entry system.'
}, {
  id: 2,
  name: 'Red Beans and Rice',
  category: 'Vegetarian',
  ingredients: [
    '2 tbsp olive oil',
    '2 tbsp all-purpose flour',
    '2 medium onions, chopped (about 2c )',
    '2 celery ribs, chopped (about 1c )',
    '1/2 medium red bell pepper, cored, seeded & chopped',
    '3 garlic cloves (minced); 1-1/2 c tomato or V8 juice',
    '3 c cooked red beans, drained (canned OK )',
    '1/2 tsp cayenne pepper (or less )',
    'Salt and pepper, to taste',
    '3 c hot cooked brown or white rice',
    'Additional Tabasco or other hot pepper sauce'
  ],
  numberOfServings: '6',
  instructions: [
    'Heat the oil in a large, heavy skillet over medium heat.',
    'stir in flour and cook stirring constantly, until mixture turns a caramel color, about 5 minutes. ',
    'Stir in the onions, celery, bell pepper and garlic.',
    'Cook stirring constantly, until vegetables are lightly browned.',
    'Stir tomato juice, beans, cayenne, and black pepper into vegetable mixture.',
    'Cook stirring occasionally, until the beans are warmed through, about 8 to 10 minutes.',
    'Mash some of the beans against the side of the pan, if desired, and stir until the mixture thickens.',
    'Taste and adjust seasonings. Serve over hot rice. Pass additional Tabasco.'
  ],
  dateCreated: new Date('1/28/2001'),
  dateModified: new Date('1/28/2001'),
  notes: 'red beans and rice, that\'s nice'
}];

module.exports = {
  async index(req, res) {
    return res.send(recipes);
  },
  async getRecipe(req, res) {
    const params = req.validate(
      // if the validation fails, "req.badRequest" will be called
      {'id': 'numeric'}
    );
    if (!params) {
      return;
    }
    const id = +req.params.id;
    return res.send(recipes.find(recipe => recipe.id === id));
  }
  //todo: find out how to connect to correct DB
  // todo: update line 77 for mongoose
};

