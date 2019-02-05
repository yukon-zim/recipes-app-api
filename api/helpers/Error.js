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
    // if inputs.err is defined, use it as a base object to copy data from
    // if it is not defined, create a new simple object
    // either way, we are setting returnError to be a new simple object

    // copying avoids issues like when Error objects do not translate well to JSON
    // we want to copy in order to copy over fields other than message
    //   one example of why we want all fields from inputs.err: mongoose validation errors
    //   mongoose validation errors have a lot of good data in them that the front-end could theoretically use
    let returnError = {};
    if (inputs.err) {
      returnError = Object.assign({}, inputs.err);
      // sails interferes with passing different error types to graphQL
      // removing toJSON allows errors of all types to bubble up to browser console
      delete returnError.toJSON;
    }
    // make sure message is populated on the returnError
    if (!returnError.message) {
      if (inputs.err && inputs.err.message) {
        // even though we copied all fields from inputs.err previously, that does not work for Error objects
        // you need to specify inputs.err.message on its own.
        // Reason: the field "message" is retrieved via a get method.  These kinds of fields are not copied over
        // when you use Object.assign() or spread operator to copy all fields.
        // The message field did not translate to JSON for our response for the same reason.
        returnError.message = inputs.err.message;
      } else if (returnError.errmsg) {
        returnError.message = returnError.errmsg;
      } else if (inputs.customMessage) {
        returnError.message = inputs.customMessage;
      } else {
        returnError.message = 'Encountered an error when submitting recipe form';
      }
    }
    return exits.success(returnError);
  }
};
