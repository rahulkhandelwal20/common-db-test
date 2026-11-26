const responseHelper = require('./response');

const errorCodes = (error) => {
  let code = 400; // 500
  switch (error.name) {
    case "ValidationError":
      code = 422;
      break;
    case "TypeError":
    case "Server Error":
      code = 500;
      break;
    case "JsonWebTokenError":
    case "TokenExpiredError":
    case "unauthorized":
      code = 401;
      break;
    case "no permission":
      code = 403;
      break;
    case "module_not_purchased":
    case "invalid_referer":
      code = 400;
      break;
    case "invalid_input":
    case "not_found":
      code = 404;
      break;
    case "Conflict":
      code = 409;
      break;
    default:
      break;
  }
  return code;
};

const errorHandler = (error, req, res, next) => {
  let code = errorCodes(error);
  responseHelper.failure(res, error, code); // code === 500 ? "something went wrong! please try again" : error;
};

module.exports = errorHandler;