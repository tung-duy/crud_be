const HttpStatusCodes = require("http-status-codes");

const defaultStatus = HttpStatusCodes.NOT_FOUND;
const defaultMessage = "Route not found!";
const { get } = require("lodash");

const errorHandler = (error, req, res, next) => {
  const response = {
    message: get(error, "message") || defaultMessage,
    detail: get(error, "detail"),
    fe: get(error, "fe"),
    type: get(error, "type"),
    code: get(error, "statusCode") || get(error, "code") || defaultStatus,
    url: get(req, "originalUrl"),
    body: get(error.body),
    query: get(error.query)
  };
  if (response.message.indexOf("connect ECONNREFUSED") >= 0) {
    Object.assign(response, {
      details: "Check please DB health status"
    });
  }
  if (process.env.NODE_ENV !== "test") {
    console.log("\n-- errorHandler --\n");
  }

  return res.status(response.code).send(response);
};
module.exports = errorHandler;
