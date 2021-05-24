class BaseError extends Error {
  constructor({ message, code, detail }) {
    super(message);
    this.code = code;
    this.detail = detail;
  }
}

class ApiError extends BaseError {
  constructor({ message, code, detail, fe }) {
    super({ message, code, detail });
    this.fe = fe;
  }
}

class ValidationError extends BaseError {}

const aclError = (req, res, next) => {
  console.log("ACL Permission error");

  return next(
    new ApiError({
      message: "Operation not permitted",
      code: 401
    })
  );
};

module.exports = {
  ApiError,
  ValidationError,
  aclError
};
