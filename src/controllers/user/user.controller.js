"use strict";
const responseHelper = require("../../util/helpers/response/response");
const { user_service } = require("../../services");
const { asyncHandler } = require("../../util/asyncHandler");
const { ACTIVE, DELETE } = require("../../configs/general.config");
const { customError } = require("../../util/helpers");
const sequelize = require("../../configs/db.pg.config");


const add = asyncHandler (async (req, res) => {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) throw Error(`request body cannot be empty.`);
    const result = await sequelize.transaction(async (transaction) => {
        let userResult = await user_service.add({ ...req.body}, transaction);
        if(!userResult) throw customError("invalid_input", `User is not created.`);
        return userResult;
    });
    responseHelper.data(res, { result, message: `User created successfully.` }, 200);
});

const userLogin = asyncHandler (async (req, res) => {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) throw Error(`request body cannot be empty.`);
    const result = await sequelize.transaction(async (transaction) => {
        let userLoginResult = await user_service.userLogin({ ...req.body}, transaction);
        if(!userLoginResult) throw customError("invalid_input", `Login has been failed.`);
        return userLoginResult;
    });

    responseHelper.data(res, { result, message: `User login successfully.` }, 200);
});

const getAll = asyncHandler(async (req, res) => {
    const result = await user_service.getAll({...req.params, ...req.query, ...{ status: ACTIVE }});
    responseHelper.pages(res, result.rows, req.query.offset ? req.query.offset / 10 : 1,  result.count, 200);
});

const getOne =  asyncHandler(async (req, res) => {
    let result = await user_service.getOne({uuid: req.params.uuid, status: ACTIVE});
    if (!result) throw customError("not_found", `No user found for this uuid.`);
    responseHelper.data(res, result, 200)
});

const moderate = asyncHandler(async (req, res) => {
  let { tenant_id, created_user_id, status, id, createdAt, ...request } = req.body
  if (Object.keys(request).length === 0 && request.constructor === Object) throw Error("request body cannot be empty");
  const result = await sequelize.transaction(async (transaction) => {
    const userResult = await user_service.moderate(request, { uuid: req.params.uuid, status: ACTIVE }, transaction);
    if (userResult?.status == 400) responseHelper.failure(res, userResult.message, 400);
    if (!userResult) throw customError("invalid_input","Update failed !");
    return userResult
  });
  responseHelper.data(res, { result, message: "User updated successfully !" }, 200);
});

const remove = asyncHandler(async (req, res) => {
  let { tenant_id, created_user_id, status, id, createdAt, updatedAt,  ...request } = req.body
  const result = await user_service.moderate({ status: DELETE }, { ...request, ...{status: ACTIVE}});
   if (result?.status == 400) responseHelper.failure(res, result.message, 400);
  if (!result) throw customError("Server Error", "Failed to remove due to a server error");
  responseHelper.success(res, "User deleted successfully !", 200);
});

module.exports = {
  add,
  userLogin,
  getAll,
  getOne,
  moderate,
  remove
};