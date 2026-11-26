const router = require("express").Router();
const validate = require("../validator/user");

router.use("/user", require("../controllers/user"));

module.exports = router;