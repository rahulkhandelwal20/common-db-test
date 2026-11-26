process.env.appName = "employee";
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./src/util/helpers/response/globalErrorHandler");
const { customError } = require("./src/util/helpers");

const sequelize = require("./src/configs/db.pg.config");

// 👇 models load
require("./src/models/postgresql/models");

const app = express();
const router = require("./src/routes");

// 🔥 middlewares
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  const cors = require("cors");
  app.use(cors({ credentials: true }));
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ✅ 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,  // new headers use karo
  legacyHeaders: false,   // old headers hata do
});

app.use(limiter);

app.set("trust proxy", 1);

app.use("/commonTest", router);

// ❗ fallback route (last me hona chahiye)
app.use("/commonTest", (req, res) => {
  throw customError("not_found", `Incorrect API request`);
});

// ❗ error handler (always last)
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

const port = process.env.PORT || 80;

// 🔥 CORRECT FLOW
sequelize
  .authenticate()
  .then(() => {
    console.log("DB Connected");

    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Tables synced");

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Common Test module listening at ${port}`);
    });

    server.keepAliveTimeout = 30 * 1000;
    server.headersTimeout = 35 * 1000;
  })
  .catch((err) => {
    console.log("Error:", err);
  });