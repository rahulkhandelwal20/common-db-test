const env = process.env;

const general = {
  listPerPage: 10,
  tempPass: "1234",
  frontendUrl: process.env.FrontendURL,
  backendURL: process.env.APIURL,
  S3_WRITE: 1,
  S3_READ: 0,
  ACTIVE: 1,
  DELETE: 0,
  JWT_SKIP_URLS: {
    "/auth/testlogin": "GET",
    "/auth/login": "POST",
    "/auth/refreshToken": "GET",
    "/auth/resetPassword": "GET",
    "/auth/resetPassword/": "GET",
    "/auth/forgetPassword": "POST",
    "/signup": "POST",
    "/auth/signup": "POST",
    "/auth/signup/": "POST",
    "/validate": "GET",
    "/auth/emailVerification": "GET",
    "/auth/emailVerification/": "GET",
  },
};

module.exports = general;