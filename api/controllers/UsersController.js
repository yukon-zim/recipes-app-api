/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming user requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
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
    if (!email) {
      const returnError = sails.helpers.error(null, `Email required`);
      res.status(404).send(returnError);
      return;
    }
    const foundUser = await User.getUser({email});
    if (!foundUser) {
      const returnError = sails.helpers.error(null, `User with email ${email} not found.`);
      res.status(404).send(returnError);
    } else {
      return res.send(foundUser);
    }
  },

  async getUserByResetToken(req, res) {
    const {resetToken} = req.params;
    if (!resetToken) {
      const returnError = sails.helpers.error(null, `Reset token required`);
      res.status(404).send(returnError);
      return;
    }
    const foundUser = await User.getUser({resetToken});
    if (!foundUser) {
      const returnError = sails.helpers.error(null, `User with this reset token not found.`);
      res.status(404).send(returnError);
    } else {
      if (foundUser.resetTokenExpiry >= Date.now()) {
        return res.send(foundUser);
      }
      const expiredError = sails.helpers.error(null, `This PW reset request has expired.`);
      res.status(404).send(expiredError);
    }
  },

  async createNewUser(req, res) {
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      superuser: req.body.superuser,
      resetToken: '',
      resetTokenExpiry: ''
    };
    try {
      const savedNewUser = await User.createNewUser(newUser);
      return res.send(savedNewUser);
    } catch (err) {
      const returnError = sails.helpers.error(err);
      return res.status(400).send(returnError);
    }
  },

  async updateUser(req, res) {
    const {id} = req.params;
    const foundUser = await User.getUser({userId: id});
    if (!foundUser) {
      const returnError = sails.helpers.error(null, `User with id ${id} not found.`);
      res.status(404).send(returnError);
    } else {
      const updatedUserData = {
        password: req.body.password || foundUser.password,
        resetToken: req.body.resetToken,
        resetTokenExpiry: req.body.resetTokenExpiry
      };
      try {
        const updatedUser = await foundUser.updateUser(updatedUserData, id);
        return res.send(updatedUser);
      } catch(err) {
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    }
  }
};
