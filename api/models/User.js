const randomId = require('random-id');
const emailValidator = require('email-validator');

checkForCharacters = (field) => {
  return field.trim().length !== 0;
};

module.exports = {
  constructSchema(schemaDefinition, sails) {
    const newSchema = sails.mongoose.Schema(schemaDefinition);
    newSchema.static('getUser', async ({userId, email, resetToken}) => {
      if (!userId && !email && !resetToken) {
        throw new Error('no user params provided');
      }
      if (userId) {
        return await User.findOne({id: userId});
      } else if (email) {
        return await User.findOne({email});
      }
      const userByToken = await User.find({resetToken});
      if (userByToken.length > 1) {
        throw new Error('More than one user found for this reset token');
      } else if (userByToken.length === 0) {
        return null;
      }
      return userByToken[0];
    });
    newSchema.static('createNewUser', async userData => {
      const id = +randomId(6, '0');
      const newUser = new User();
      newUser.name = userData.name;
      newUser.email = userData.email;
      newUser.password = userData.password;
      newUser.superuser = userData.superuser;
      newUser.resetToken = userData.resetToken;
      newUser.resetTokenExpiry = userData.resetTokenExpiry;
      newUser.id = id;
      try {
        return await newUser.save();
      } catch(err) {
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    });
    return newSchema;
  },
  schema: {
    id: {
      type: Number,
      unique: true,
      required: true
    },
    name: {
      type: String,
      required: true,
      // disallow strings only of spaces
      custom: checkForCharacters
    },
    email: {
      type: String,
      unique: true,
      required: true,
      // disallow strings only of spaces
      custom: emailValidator.validate
    },
    password: {
      type: String,
      required: true,
      // disallow strings only of spaces
      custom: checkForCharacters
    },
    superuser: {
      type: Boolean,
      required: true
    },
    resetToken: {
      type: String
    },
    resetTokenExpiry: {
      type: String
    },
  },
  async getUsers(criteriaObj) {
    return await User.find(criteriaObj);
  },
  async updateUser(userData, id) {
    await User.update({id}).set(userData);
    return await User.findOne({id});
  }
};
