module.exports = {
  friendlyName: 'buildErrorResponse',

  description: 'standardizes error response returned to the UI',

  sync: true,

  inputs: {
    err: {
      type: 'ref',
      example: new Error(),
      description: 'the error thrown by the API/db',
      required: false
    },
    customMessage: {
      type: 'string',
      example: 'No files retrieved from import request',
      description: 'custom error message thrown in cases where err does not exist',
      required: false
    }
  },

  fn (inputs, exits) {
    let returnError = inputs.err;
    if (!returnError) {
      returnError = {message: inputs.customMessage};
    }
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
