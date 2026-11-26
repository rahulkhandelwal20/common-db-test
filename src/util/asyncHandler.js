const appInsights = require('applicationinsights');
if (process.env.AzureInstrumentationKey) {
  appInsights.setup(process.env.AzureInstrumentationKey)
    .setAutoCollectRequests(true)
    .setAutoCollectExceptions(true)
    .start();
}
 
const client = appInsights.defaultClient;


const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      if (client) {
        client.trackException({ exception: err });
      };
      next(err)
    });
  };
};

const asyncHandlerService = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      client.trackException({ exception: err,  });
      next(err)
    });
  };
};

module.exports = { asyncHandler, asyncHandlerService };
