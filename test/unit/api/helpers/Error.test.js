const chai = require('chai');

const expect = chai.expect;

describe('error helper tests', () => {
  it('should return an object with a message property', () => {
    const returnObj = sails.helpers.error();
    expect(returnObj).to.have.property('message');
  });

  it('should return an error with a custom message if no error is supplied', () => {
    const customMsg = 'custom message';
    const returnObj = sails.helpers.error(null, customMsg);
    expect(returnObj).to.have.property('message').that.equals(customMsg);
  });

  it('should correctly handle errors with a message property', () => {
    const errorMsg = 'test error message';
    const errorWithMsg = new Error(errorMsg);
    const returnObj = sails.helpers.error(errorWithMsg);
    expect(returnObj).to.have.property('message').that.equals(errorMsg);
  });

  it('should correctly handle errors with an errmsg property', () => {
    const errorMsg = 'test error message';
    const errorWithErrMsg = new Error();
    errorWithErrMsg.errmsg = errorMsg;
    const returnObj = sails.helpers.error(errorWithErrMsg);
    expect(returnObj).to.have.property('message').that.equals(errorMsg);
  });
});
