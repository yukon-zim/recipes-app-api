/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming user requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const idParamValidator = {'id': 'numeric'};

module.exports = {
  async getUsers(req, res) {
    const users = await User.getUsers({});
    return res.send(users);
  },
  //todo: this gets a user by ID.  will we need a means of getting a user by email for login?
  async getUser(req, res) {
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
    const foundUser = await Recipe.getUser(id);
    if (!foundUser) {
      res.status(404).send(`User for ID ${id} not found.`);
    } else {
      return res.send(foundUser);
    }
  },
  async createNewUser(req, res) {
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      permissions: req.body.permissions,
      // resetToken: '',
      // resetTokenExpiry: ''
    };
    try {
      const savedNewUser = await User.createNewUser(newUser);
      return res.send(savedNewUser);
    } catch(err) {
      const returnError = sails.helpers.error(err);
      return res.status(400).send(returnError);
    }
  }
};
