checkForCharacters = (field) => {
  return field.trim().length === 0;
};

module.exports = {
  attributes: {
    id: {
      columnName: 'user_id',
      type: 'Number',
      unique: true,
      // todo: how to generate rando unique user ID?
    },
    name: {
      type: 'String',
      unique: false,
      required: true,
      // disallow strings only of spaces to maintain UI access to recipe
      // todo: abstracted correctly?
      custom: checkForCharacters(name)
    },
    email: {
      // todo: type string appropriate?
      type: 'String',
      unique: true,
      required: true,
      // disallow strings only of spaces to maintain UI access to recipe
      custom: checkForCharacters(email)
    },
    password: {
      type: 'String',
      required: true,
      // pw from yoga server will never be blank - no need to check?
      custom: checkForCharacters(password)
    },
    permissions: {
      type: 'Array',
      required: true
    },
    // resetToken: {
    //   type: 'String'
    // },
    // resetTokenExpiry: {
    //   type: 'String',
    // },
  },
  async getUser(userId, email) {
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
