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
      console.log('user data:');
      console.log(userData);
      const id = +randomId(6, '0');
      const newUser = new User({superuser: false});
      console.log(newUser);
      newUser._doc.attributes.name = userData.name;
      newUser._doc.name = userData.name;
      newUser._doc.attributes.email = userData.email;
      newUser._doc.email = userData.email;
      newUser._doc.attributes.password = userData.password;
      newUser._doc.password = userData.password;
      newUser._doc.attributes.superuser = userData.superuser;
      newUser._doc.superuser = userData.superuser;
      newUser._doc.attributes.resetToken = userData.resetToken;
      newUser._doc.attributes.resetTokenExpiry = userData.resetTokenExpiry;
      newUser._doc.attributes.id = id;
      newUser._doc.id = id;
      console.log(newUser);
      try {
        const savedUser = await newUser.save();
          console.log('saved user:');
        console.log(savedUser);
          return savedUser;
      } catch(err) {
        const returnError = sails.helpers.error(err);
        return res.status(400).send(returnError);
      }
    });
    // newSchema.pre('validate', next => {
    //   console.log('called');
    //   const id = randomId(6, '0');
    //   this._doc.attributes.id = id;
    //   next();
    // });
    return newSchema;
  },
  schema: {
    attributes: {
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
    }
  },
  // beforeCreate(valuesToSet, proceed) {
  //   // generating rando numerical user_ids to work around sails crap
  //   console.log('called');
  //   const id = randomId(6, '0');
  //   valuesToSet.id = id;
  //   proceed();
  // },
  // async getUser({userId, email, resetToken}) {
  //   if (!userId && !email && !resetToken) {
  //     throw new Error('no user params provided');
  //   }
  //   if (userId) {
  //     return await User.findOne({id: userId});
  //   } else if (email) {
  //     return await User.findOne({email});
  //   }
  //   const userByToken = await User.find({resetToken});
  //   if (userByToken.length > 1) {
  //     throw new Error('More than one user found for this reset token');
  //   } else if (userByToken.length === 0) {
  //     return null;
  //   }
  //   return userByToken[0];
  // },
  async getUsers(criteriaObj) {
    return await User.find(criteriaObj);
  },
  // async createNewUser(userData) {
  //   return await User.create(userData).fetch();
  // },
  async updateUser(userData, id) {
    await User.update({id}).set(userData);
    return await User.findOne({id});
  }
};
