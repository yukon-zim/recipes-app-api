module.exports = {
  buildErrorResponse(err) {
    const returnError = err;
    if (!returnError.message) {
      if (returnError.errmsg) {
        returnError.message = returnError.errmsg;
      } else {
        returnError.message = 'Encountered an error when submitting recipe form';
      }
      return returnError;
    }
  }
};
