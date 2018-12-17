const randomId = require('random-id');
const emailValidator = require('email-validator');

checkForCharacters = (field) => {
  return field.trim().length !== 0;
};

module.exports = {
  attributes: {
    id: {
      columnName: 'user_id',
      type: 'Number',
      autoIncrement: true,
      unique: true,
    },
    name: {
      type: 'String',
      unique: false,
      required: true,
      // disallow strings only of spaces
      custom: checkForCharacters
    },
    email: {
      type: 'String',
      unique: true,
      required: true,
      // disallow strings only of spaces
      custom: emailValidator.validate
    },
    password: {
      type: 'String',
      required: true,
      // disallow strings only of spaces
      custom: checkForCharacters
    },
    superuser: {
      type: 'Boolean',
      required: true
    },
    resetToken: {
      type: 'String'
    },
    resetTokenExpiry: {
      type: 'String',
    },
  },
  beforeCreate(valuesToSet, proceed) {
    // generating rando numerical user_ids to work around sails crap
    const id = randomId(6, '0');
    valuesToSet.id = id;
    proceed();
  },
  async getUser({userId, email, resetToken}) {
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
  },
  async getUsers(criteriaObj) {
    return await User.find(criteriaObj);
  },
  async createNewUser(userData) {
    return await User.create(userData).fetch();
  },
  async updateUser(userData, id) {
    await User.update({id}).set(userData);
    return await User.findOne({id});
  }
};
