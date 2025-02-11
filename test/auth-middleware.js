const { expect } = require("chai");
const authMiddleware = require("../middleware/is-auth");

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
});
