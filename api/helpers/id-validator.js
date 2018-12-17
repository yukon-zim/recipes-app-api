module.exports = {
  friendlyName: 'verifyNumericalId',

  description: 'verifies that an ID harvested from URL/route is numerical, then converts it from string -> number',

  sync: true,

  inputs: {
    req: {
      type: 'ref',
      example: null,
      description: 'the incoming request from the graphQL yoga server',
      required: true
    }
  },
  exits: {
    id: {
      description: 'recipe or user ID as number',
      required: true
    }
  },


  fn: async function (inputs, exits) {
    // validation
    const paramsValidated = inputs.req.validate(
      // if the validation fails, "req.badRequest" will be called
      {'id': 'numeric'}
    );
    if (!paramsValidated) {
      return;
    }
    // convert ID from URL to number
    const id = +paramsValidated.id;
    // All done.
    return exits.success(id);
  }


};

