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
    // resetToken: {
    //   type: 'String'
    // },
    // resetTokenExpiry: {
    //   type: 'String',
    // },
  },
  beforeCreate(valuesToSet, proceed) {
    // generating rando numerical user_ids to work around sails crap
    const id = randomId(6, '0');
    valuesToSet.id = id;
    proceed();
  },
  async getUser({userId, email}) {
    if (userId) {
      return await User.findOne({id: userId});
    }
    return await User.findOne({email});
  },
  async getUsers(criteriaObj) {
    return await User.find(criteriaObj);
  },
  async createNewUser(userData) {
    return await User.create(userData).fetch();
  },

};
