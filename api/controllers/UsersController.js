/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming user requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  async getUsers(req, res) {
    const users = await User.getUsers({});
    return res.send(users);
  },

  async getUser(req, res) {
    // validation
    const id = sails.helpers.idValidator(req);
    // look up user
    const foundUser = await User.getUser({userId: id});
    if (!foundUser) {
      const returnError = sails.helpers.error(null, `User for ID ${id} not found.`);
      res.status(404).send(returnError);
    } else {
      return res.send(foundUser);
    }
  },

  async getUserByEmail(req, res) {
    const {email} = req.query;
    const foundUser = await User.getUser({email});
    if (!foundUser) {
      const returnError = sails.helpers.error(null, `User with email ${email} not found.`);
      res.status(404).send(returnError);
    } else {
      return res.send(foundUser);
    }
  },

  async createNewUser(req, res) {
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      superuser: req.body.superuser,
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
