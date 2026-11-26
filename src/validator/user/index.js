const { body, query, oneOf } = require("express-validator");
module.exports = (method) => {
  switch (method) {
    case "addUser": {
      return [
            body("email", "email is required").exists(), 
            body("password", "password is required").exists()
        ];
    }
  }
};