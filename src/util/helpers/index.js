const { makeResponse } = require("./response");
const { messages } = require("./messages");
const { codes } = require("./status-codes");
const  { getPropId } = require("./prop-type")


const customError = (name, message) => {
  let error = new Error(message);
  error.name = name;
  return error;
};


module.exports = {
  makeResponse,
  messages,
  codes,
  customError
};