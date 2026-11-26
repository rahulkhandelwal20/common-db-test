"use strict";

const { db } = require("../../../models/postgresql/models/");
const excludeFromContact = [
  "name",
  "tenant_id",
  "create_user_id",
  "account_id",
  "title",
];
const redis = require("../../../util/db/redis");
const methods = {
  get: ["a", "d", "e", "i", "v", "x", "*"],
  post: ["e", "a", "*"],
  put: ["e", "a", "*"],
  delete: ["e", "d", "*"],
  download: ["dw", "v", "*"],
  import: ["i", "e", "*"],
  export: ["x", "*"],
  approval: ["apv", "*"],
};

const filterContactFields = (request) => {
  const { crm } = db();
  const ModelSchema = Object.keys(crm.Contact.rawAttributes);
  const reqKeys = Object.keys(request);
  let mactched = reqKeys.filter((x) => ModelSchema.includes(x));
  let contact_fields = {};
  mactched.forEach((key) => {
    if (!excludeFromContact.includes(key)) {
      contact_fields[key] = request[key];
      delete request[key];
    }
  });
  return { request, contact_fields };
};

const additionalObjMongo = (request, Model) => {
  const ModelSchema = Object.keys(Model.schema.tree);
  request = getAdditionalFields(request, ModelSchema);
  return request;
};

const additionalObjSql = (request, Model) => {
  const ModelSchema = Object.keys(Model.rawAttributes);
  request = getAdditionalFields(request, ModelSchema);
  return request;
};

const getAdditionalFields = (request, schema) => {
  const reqKeys = Object.keys(request);
  let additional_data = {};
  let difKeys = reqKeys.filter((x) => !schema.includes(x));
  difKeys.forEach((key) => {
    additional_data[key] = request[key];
    delete request[key];
  });
  // Add middleware function to filter only dynamic fields from additional data based on tenant from dynamic filed modal --> pending
  if (
    additional_data &&
    Object.keys(additional_data).length !== 0 &&
    Object.getPrototypeOf(additional_data) === Object.prototype
  ) {
    request["additional_data"] = additional_data;
  }
  return request;
};

const additionalMerge = (response) => {
  if (response && response.additional_data !== undefined) {
    let additional_data = response.additional_data;
    delete response.additional_data;
    response = { ...additional_data, ...response };
  }
  return response;
};

const getUniqueCode = async (Model, length = 3) => {
  try {
    var name = Model.name.substring(0, length).toUpperCase();
    var pad = "00000000";
    const lastItem = await Model.findOne({
      attributes: ["id"],
      order: [["id", "DESC"]],
    });

    if (lastItem && lastItem.message) return false;
    var id =
      lastItem && lastItem.dataValues
        ? parseInt(lastItem.dataValues.id) + 1
        : 1;
    const code = name + pad.substring(0, pad.length - id ? id.length : 0) + id;
    return code;
  } catch (error) {
    return false;
  }
};

const getIdFromUUID = async (Model, args) => {
  try {
    const result = await Model.findOne({
      attributes: ["id"],
      where: args,
    });
    if (result && result.dataValues) return result.dataValues.id;
    else false;
  } catch (error) {
    throw error;
  }
};

const getcontactIdFromUUID = async (Model, args) => {
  try {
    const result = await Model.findOne({
      attributes: ["contact_id"],
      where: args,
    });
    if (result && result.dataValues) return result.dataValues.contact_id;
    else false;
  } catch (error) {
    throw error;
  }
};

const getDetailsFromUUID = async (Model, args, columns = []) => {
  try {
    const result = await Model.findOne({
      attributes: columns,
      where: args,
    });
    if (result && result.dataValues) return result.dataValues;
    else false;
  } catch (error) {
    throw error;
  }
};

const getDetailsFromID = async (Model, args, columns = []) => {
  try {
    const result = await Model.findOne({
      attributes: columns,
      where: args,
    });
    if (result && result.dataValues) return result.dataValues;
    else false;
  } catch (error) {
    throw error;
  }
};

const getIdFromUUIDArr = async (Model, args) => {
  try {
    let idArr = [],
      result = await Model.findAll({
        attributes: ["id", "uuid"],
        where: args,
        raw: true,
      });
    console.log(result, "result");
    result.map((item) => {
      if (args.uuid.includes(item.uuid)) {
        idArr.push(item.id);
      }
    });
    return idArr;
  } catch (error) {
    throw error;
  }
};

const getUuidToIdMapArr = async (Model, args) => {
  try {
    const result = await Model.findAll({
      attributes: ["id", "uuid"],
      where: args,
      raw: true,
    });

    const uuidToIdMap = {};
    result.forEach((item) => {
      uuidToIdMap[item.uuid] = item.id;
    });

    return uuidToIdMap; // e.g. { "uuid1": 101, "uuid2": 102 }
  } catch (error) {
    throw error;
  }
};

const getDetailsFromUUIDArr = async (Model, args) => {
  try {
    let idArr = [],
      result = await Model.findAll({
        attributes: ["id", "uuid", "is_admin"],
        where: args,
        raw: true,
      });
    console.log(result, "result");
    result.map((item) => {
      if (args.uuid.includes(item.uuid)) {
        idArr.push(item.id);
      }
    });
    return idArr;
  } catch (error) {
    throw error;
  }
};

const getEmailsFromUserIDArr = async (Model, args) => {
  try {
    let emailNameArr = [],
      result = await Model.findAll({
        attributes: ["prop_id", "email", "name", "tenant_id"],
        where: args,
        raw: true,
      });
    console.log(args, "args");
    result.map((item) => {
      emailNameArr.push({
        id: item.prop_id,
        email: item.email,
        name: item.name,
        tenant_id: item.tenant_id, // Include tenant_id in emailNameArr
      });
    });
    return emailNameArr;
  } catch (error) {
    throw error;
  }
};

const getUUIDFromIdArr = async (Model, args) => {
  try {
    let uuidArr = [],
      result = await Model.findAll({
        attributes: ["id", "uuid"],
        where: args,
        raw: true,
      });
    result.map((item) => {
      if (args.id.includes(item.id)) {
        uuidArr.push(item.uuid);
      }
    });
    return uuidArr;
  } catch (error) {
    throw error;
  }
};

const getIdFromUUIDs = async (Model, args) => {
  try {
    return await Model.findAll({
      attributes: ["id", "uuid"],
      where: { ...args },
      raw: true,
    });
  } catch (error) {
    throw error;
  }
};

const getIdFromCodes = async (Model, args) => {
  try {
    return await Model.findAll({
      attributes: ["id", "uuid", "code"],
      where: { ...args },
      raw: true,
    });
  } catch (error) {
    throw error;
  }
};

const getArrayObjDif = (a, b) => {
  function comparer(otherArray) {
    return function (current) {
      return (
        otherArray.filter(function (other) {
          return (
            other.material_id == current.material_id &&
            other.vendor_id == current.vendor_id
          );
        }).length == 0
      );
    };
  }

  var onlyInA = a.filter(comparer(b));
  var onlyInB = b.filter(comparer(a));

  return onlyInA;
};
const getArrayObjDifInventory = (a, b) => {
  function comparer(otherArray) {
    return function (current) {
      return (
        otherArray.filter(function (other) {
          return (
            other.inventory_id == current.inventory_id &&
            other.vendor_id == current.vendor_id
          );
        }).length == 0
      );
    };
  }

  var onlyInA = a.filter(comparer(b));
  var onlyInB = b.filter(comparer(a));

  return onlyInA;
};
const checkForDuplicacy = async (Model, args) => {
  try {
    const result = await Model.findOne(args);
    if (result && result.id) return true;
    return false;
  } catch (error) {
    return false;
  }
};

const filterContactList = (request) => {
  const { crm } = db();
  let contact_fields = [];
  const ModelSchema = Object.keys(crm.Contact.rawAttributes);
  let reqKeys;
  request.map((ele) => {
    reqKeys = Object.keys(ele);
    let mactched = reqKeys.filter((data) => ModelSchema.includes(data));
    let x = {};
    mactched.forEach((key) => {
      if (!excludeFromContact.includes(key)) {
        x[key] = ele[key];
        delete ele[key];
      }
    });
    contact_fields.push({
      ...x,
      tenant_id: ele.tenant_id,
      create_user_id: ele.create_user_id,
    });
  });
  return { request, contact_fields };
};

const getCustomFieldValues = async (request, where) => {
  const { setup } = db();
  const { FieldEntity } = setup;
  const fieldEntity = await FieldEntity.findAll({
    where: {
      ...where,
    },
  });

  const prepareFieldValues = [];
  fieldEntity.forEach((field) => {
    if (
      request[field.field_name] !== undefined &&
      request[field.field_name] !== null
    ) {
      prepareFieldValues.push({
        field_id: field.id,
        value: request[field.field_name],
      });
      delete request[field.field_name];
    }
  });

  return { request, prepareFieldValues };
};

const additionalObjList = (request, Model) => {
  const ModelSchema = Object.keys(Model.rawAttributes);
  request = getAdditionalList(request, ModelSchema);
  return request;
};

const additionalAllMerge = (response) => {
  return response.map((item) => {
    const { additional_data, ...rest } = item;
    for (let key in additional_data) {
      if (typeof additional_data[key] !== "object") {
        rest[key] = additional_data[key];
      } else {
        if (Array.isArray(additional_data[key])) {
          rest[key] = additional_data[key].toString();
        } else {
          for (let addKey in additional_data[key]) {
            rest[`${key}_${addKey}`] = additional_data[key][addKey];
          }
        }
      }
    }
    return rest;
  });
};

const contactObjList = (request) => {
  const { crm } = db();
  const ModelSchema = Object.keys(crm.Contact.rawAttributes);
  let reqKeys;
  request.map((element) => {
    reqKeys = Object.keys(element);
    reqKeys.filter((data) => ModelSchema.includes(data));
  });
  return { request };
};

const getAdditionalList = (request, schema) => {
  let reqKeys;
  request.map((ele) => {
    reqKeys = Object.keys(ele);
    let additional_data = {};
    let difKeys = reqKeys.filter((data) => !schema.includes(data));
    difKeys.forEach((key) => {
      additional_data[key] = ele[key];
      delete ele[key];
    });
    // Add middleware function to filter only dynamic fields from additional data based on tenant from dynamic filed modal --> pending
    if (
      additional_data &&
      Object.keys(additional_data).length !== 0 &&
      Object.getPrototypeOf(additional_data) === Object.prototype
    ) {
      ele["additional_data"] = additional_data;
    }
  });
  return request;
};

const upsert = async (Model, values, condition) => {
  return await Model.findOne({ where: condition }).then(function (obj) {
    // update
    if (obj) return obj.update(values);
    // insert
    return Model.create(values);
  });
};

const materialPriceAllMeasurement = (response) => {
  response = response.map((item) => {
    for (let key in item.measurement) {
      if (typeof item.measurement[key] !== "object") {
        item[key] = item.measurement[key];
      } else {
        for (let addKey in item.measurement[key]) {
          item[`${key}_${addKey}`] = item.measurement[key][addKey];
        }
      }
    }
    delete item.measurement;
    return item;
  });
  return response;
};

const getUniqueCodes = async (request, Model, length = 3) => {
  try {
    var pad = "00000000";
    const lastItem = await Model.findOne({
      attributes: ["id"],
      order: [["id", "DESC"]],
      raw: true,
    });

    let id = 1;
    if (lastItem && lastItem.id) {
      id = parseInt(lastItem.id) + 1;
    }

    const codes = [];
    const name = Model.name.substring(0, length).toUpperCase();

    for (let i = 0; i < request.length; i++) {
      const code =
        name + pad.substring(0, pad.length - id ? id.length : 0) + id;
      codes.push(code);
      id++;
    }
    return codes;
  } catch (error) {
    throw new Error("Failed to generate unique codes.");
  }
};

const getPluginDetails = async (request, pluginType) => {
  const { sequelize } = db();
  const { tenant_id, create_user_id, plugin_detail_id } = request;
  let userDetails;
  // let userDetailsRedis = await redis.get(`${tenant_id}_plugin_details`);
  // if(userDetailsRedis) return userDetails = JSON.parse(userDetailsRedis);

  let w = `WHERE f.tenant_id= :tenant_id AND f.status= 1`;
  if (create_user_id) {
    w = `WHERE f.tenant_id= :tenant_id AND f.status= 1 AND f.create_user_id = :create_user_id`;
  }
  if (plugin_detail_id) {
    w = `WHERE f.uuid =:plugin_detail_id AND f.status= 1`;
  }
  let sql = `SELECT f.credentials, f.uuid, f.codeverifier FROM "PluginDetails" as f
      INNER JOIN "Plugins" p ON f.plugin_id=p.id AND p.name=:pluginType AND p.status=1
      ${w} ORDER BY f.id DESC LIMIT 1`;
  userDetails = await sequelize.query(sql, {
    replacements: {
      tenant_id: tenant_id,
      create_user_id: create_user_id,
      pluginType,
      plugin_detail_id,
    }, // Include 'pid' in replacements
    type: sequelize.QueryTypes.SELECT,
    plain: true,
  });

  if (!userDetails) {
    w = `WHERE f.tenant_id= :tenant_id AND f.status= 1`;
    if (plugin_detail_id) {
      w = `WHERE f.uuid =:plugin_detail_id AND f.status= 1`;
    }
    let sql = `SELECT f.credentials, f.uuid, f.codeverifier FROM "PluginDetails" as f
        INNER JOIN "Plugins" p ON f.plugin_id=p.id AND p.name=:pluginType AND p.status=1 AND p.enabled_status=1
        ${w} ORDER BY f.id DESC LIMIT 1`;
    userDetails = await sequelize.query(sql, {
      replacements: { tenant_id: tenant_id, pluginType, plugin_detail_id }, // Include 'pid' in replacements
      type: sequelize.QueryTypes.SELECT,
      plain: true,
    });
  }

  if (!userDetails.credentials) return { message: "Invalid User" };
  // if(!userDetailsRedis) {
  //   redis.set(`${tenant_id}_plugin_details`, JSON.stringify(userDetails));
  // }
  return userDetails;
};

const filterRetailerContactFields = (request) => {
  const { rcrm } = db();
  const { RetailContact } = rcrm;
  const ModelSchema = Object.keys(RetailContact.rawAttributes);
  const reqKeys = Object.keys(request);
  let mactched = reqKeys.filter((x) => ModelSchema.includes(x));
  let contact_fields = {};
  mactched.forEach((key) => {
    if (!excludeFromContact.includes(key)) {
      contact_fields[key] = request[key];
      delete request[key];
    }
  });
  return { request, contact_fields };
};

const getArrayOfData = async (Model, args, attributes) => {
  try {
    return await Model.findAll({
      attributes: attributes,
      where: { ...args },
      raw: true,
    });
  } catch (error) {
    throw error;
  }
};

const getPolicyDetails = async (request, moduleType, SubModule, method) => {
  try {
    const permissionJSON = request.user.policies;
    const permissionTemp =
      (permissionJSON[moduleType] &&
        (permissionJSON[moduleType][SubModule] ||
          permissionJSON[moduleType]["*"])) ||
      [];
    if (
      methods[method] &&
      methods[method].some(
        (item) =>
          permissionTemp.hasOwnProperty(item) && permissionTemp[item] === 1,
      )
    ) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  additionalObjMongo,
  additionalObjSql,
  additionalMerge,
  getIdFromUUID,
  getUUIDFromIdArr,
  getIdFromUUIDArr,
  getUniqueCode,
  getArrayObjDif,
  getArrayObjDifInventory,
  checkForDuplicacy,
  filterContactFields,
  filterContactList,
  additionalObjList,
  additionalAllMerge,
  contactObjList,
  getIdFromUUIDs,
  getIdFromCodes,
  upsert,
  getCustomFieldValues,
  materialPriceAllMeasurement,
  getUniqueCodes,
  getEmailsFromUserIDArr,
  getDetailsFromUUID,
  getcontactIdFromUUID,
  getDetailsFromUUIDArr,
  getUuidToIdMapArr,
  getDetailsFromID,
  getPluginDetails,
  filterRetailerContactFields,
  getArrayOfData,
  getPolicyDetails,
};
