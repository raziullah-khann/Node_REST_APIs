const { expect } = require("chai");
const authMiddleware = require("../middleware/is-auth");
const jwt = require("jsonwebtoken");
const sinon = require('sinon');

describe("Auth Midddleware", () => {
  it("should throw an error if no authorization header is present", () => {
    const req = {
      get: function () {
        return null;
      },
    };
    expect(authMiddleware.bind(null, req, {}, () => {})).to.throw(
      "Not Authenticate user"
    );
  });

  it("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: function () {
        return "xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("");
  });

  it("should yield a userId after decoding the token", () => {
    const req = {
      get: function () {
        return "Bearer xyznkjdkjajdkad";
      },
    };
    const jwtStub = sinon.stub(jwt, 'verify')
    jwtStub.returns({ userId: 'abc' });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", 'abc');
    expect(jwt.verify.called).to.be.true;
    // Restore the original jwt.verify method
    jwtStub.restore();
  });

  it("should throw an error if the token is cannot be verified", () => {
    const req = {
      get: function () {
        return "Bearer xyz";
      },
    };
    // jwt.verify = function () {
    //   throw new Error("Invalid token");
    // };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("");
  });
});
