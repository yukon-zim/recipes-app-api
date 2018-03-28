module.exports = {
  friendlyName: 'buildErrorResponse',

  description: 'standardizes error response returned to the UI',

  inputs: {
    err: {
      type: 'ref',
      example: new Error(),
      description: 'the error thrown by the API/db',
      required: true
    }
  },

  async fn (inputs, exits) {
    const returnError = inputs.err;
    if (!returnError.message) {
      if (returnError.errmsg) {
        returnError.message = returnError.errmsg;
      } else {
        returnError.message = 'Encountered an error when submitting recipe form';
      }
    }
    return exits.success(returnError);
  }
};
