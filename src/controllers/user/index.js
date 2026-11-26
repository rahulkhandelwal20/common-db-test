"use strict";
const express = require("express");
const router = express.Router();
const validate = require("../../validator/user");
const {authMiddleware, roleMiddleware} = require("../../middlewares/auth");

const userController = require("./user.controller");

router.post("/register", validate("addUser"),userController.add);

router.post("/login", validate("addUser"),userController.userLogin);

router.get("/", authMiddleware, roleMiddleware(["super_admin", "admin"]), userController.getAll);

router.get("/:uuid", authMiddleware, roleMiddleware(["super_admin", "admin"]), userController.getOne);

router.put("/:uuid", authMiddleware, roleMiddleware(["super_admin", "admin"]), userController.moderate);

router.delete("/", authMiddleware, roleMiddleware(["super_admin", "admin"]), userController.remove);

module.exports = router;