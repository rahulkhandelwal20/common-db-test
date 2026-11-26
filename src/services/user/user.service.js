const { User } = require("../../models/postgresql/models");
const { saveAuditLog } = require("../../util/auditLog");
const bcrypt = require("bcrypt");
const { customError } = require("../../util/helpers");
const jwt = require("jsonwebtoken");
const sequelize = require("../../configs/db.pg.config");

const add = async (request, transaction) => {

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
        throw customError("invalid_input", "Invalid email format");
    }

    // Duplicate email check
    const existingUser = await User.findOne({
        where: { email: request.email },
        transaction,
    });

    if (existingUser) {
        throw customError("invalid_input", `Email already exists`);
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(request.password, 10);

    let result = (await User.create( {...request, password: hashedPassword}, { transaction })).get({ plain: true });

    if(result && Object.keys(result).length > 0) {
        // Save Audit Log for AccSubContract
        await saveAuditLog({
        tableName: "users",
        moduleName: "authTask",
        submoduleName: "authTask",
        recordId: result.id,
        oldData: {},
        newData: result,
        operationType: "INSERT",
        tenantId: request.tenant_id,
        userId: request.create_user_id,
        transaction,
        });
    };

    return result;
};

const userLogin = async (request, transaction) => {
    
    const user = await User.findOne({
        where: { email: request.email },
        plain: true,
        raw: true,
        transaction,
    });

    if (!user) {
        throw customError("invalid_input", "Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(request.password, user.password);

    if (!isMatch) {
        throw customError("invalid_input", "Invalid email or password");
    }

    // Generate JWT token
    const accessToken = jwt.sign(
        {
        id: user.id,
        email: user.email,
        role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 🔥 Refresh Token (long)
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );


    return {
        uuid: user.uuid,
        email: user.email,
        accessToken,
        refreshToken,
    };
    
};

const getAll = async (query) => {

  let orderby,
    {
      offset = 0,
      limit = 10,
      sortby = "updatedAt",
      sort = "DESC",
      status = 1,
      search,
      ...where
    } = query;

  let select = `SELECT  u.uuid, u.email, u.role, u.status, u."createdAt", u."updatedAt"`;

  let sql = `FROM "users" as u`;

  let w = `WHERE u.status = :status`;

  for (const key in where) {
    if (where[key] !== "") {
      w += ` AND `;
      if (key === "email" || key === "role") {
        w += `u."${key}" = :${key}`;
        where[key] = `${where[key]}`;
      } else if (["createdAt", "updatedAt"].includes(key) && Array.isArray(where[key]) && where[key].length == 2) {
        w += `u."${key}" BETWEEN :${key}_start_range AND :${key}_end_date`;
        where[`${key}_start_range`] = ` ${where[key][0]} `;
        where[`${key}_end_date`] = ` ${where[key][1]} 23:59:59`;
      } else {
        w += `u."${key}" ILIKE :${key}`;
        where[key] = `%${where[key]}%`;
      }
    }
  }

  if (search && search !== "") {
    w += ` AND (u.email ILIKE :search OR u.username ILIKE :search)`;
    where.search = `%${search}%`;
  }

  orderby =
    sortby !== "id"
      ? `u."${sortby}" ${sort}, u."updatedAt" DESC`
      : `u."id", u."updatedAt" ${sort}`;

  const rowsFilter =
    limit >= 0
      ? `LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
      : `OFFSET ${parseInt(offset)}`;

  const rows = await sequelize.query(
    ` ${select} ${sql} ${w} ORDER BY ${orderby} ${rowsFilter}`,
    {
      replacements: { ...where, status },
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    }
  );

  const count = await sequelize.query(`SELECT COUNT(*) ${sql} ${w}`, {
    replacements: { ...where, status },
    type: sequelize.QueryTypes.SELECT,
  });

  return { rows, count: parseInt(count[0].count) };
};

const getOne = async (query) => {
    let { uuid, status = 1, ...where } = query;

    if (uuid === ":uuid") {
        throw customError("invalid_input", `Please add consolidation account uuid.`);
    };

    const userId = await User.findOne({ 
        where:{uuid, status}, 
        raw: true
    });
    if (!userId) throw customError("invalid_input", `Incorrect user id.`);

    let select = `SELECT  u.uuid, u.email, u.role, u.status, u."createdAt", u."updatedAt"`;

    let sql = `FROM "users" as u`;

    let w = `WHERE u.uuid = :uuid AND u.status = :status`;

    const userDetail = await sequelize.query(`${select} ${sql} ${w}`, {
        replacements: { ...where, uuid, status },
        type: sequelize.QueryTypes.SELECT,
        plain: true,
    });

    return userDetail;
};

const moderate = async (request, where, transaction) => {
  if (where.uuid === ":uuid") {
    throw customError("Invalid Input", "Please add form custom field uuid !");
  }

  const isExist = await User.findOne({ where });
  if (!isExist) {
    return {
      message: `No form custom field found with this id`,
      status: 400,
    };
  };

  if (request.password !== undefined) {
    request.password = await bcrypt.hash(request.password, 10);
  };

  const [rowsUpdated, updatedUser] = await User.update(
    { ...request },
    {
      where,
      returning: true, // This option allows the updated rows to be returned
      transaction
    }
  );

  if (rowsUpdated === 0) {
    throw customError("No rows were updated");
  }

  const updateUserData = updatedUser[0].get({ plain: true });

  return updateUserData;
};

const getOneHHold = async (query) => {
    const { formBuilder, sequelize } = db();
    const { FormCustomField } = formBuilder;
    let { uuid, tenant_id, status = 1, create_user_id, ...where } = query;

    if (uuid === ":uuid") {
      throw customError("Invalid Input", "Please add form custom field uuid !");
    }
  
    let categoryId =   await getDetailsFromUUID(FormCustomField, { uuid, status }, ["id", "name"]);
    if (!categoryId) throw customError("Invalid_Input", `Incorrect form custom field id !`);
  
    let customPropertyDetails = `COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
            'uuid', fcfp.uuid,
            'name', fcfp.name,
            'sequence', fcfp.sequence,
            'is_visible', fcfp.is_visible,
            'createdAt', DATE(fcf."createdAt"),
            'updatedAt', DATE(fcf."updatedAt")
            )
        ) FILTER (WHERE fcfp.uuid IS NOT NULL), 
        '[]'
      ) AS form_custom_field_property_details`;
    
    let select = `SELECT  fcf.uuid, fcf.name, fcf.hint, fcf.sequence, fcf.is_visible, CONCAT(u.firstname,' ', u.lastname) as created_by, DATE(fcf."createdAt") as "createdAt", DATE(fcf."updatedAt") as "updatedAt", ${customPropertyDetails}`;
    
    let sql = `FROM "FormCustomFields" as fcf
      LEFT JOIN "FormCustomFieldProperties" as fcfp on fcfp.form_custom_field_id = fcf.id AND fcfp.status = :status
      LEFT JOIN "users" as u on u.id = fcf.create_user_id AND u.tenant_id = :tenant_id AND u.status = :status`;
    
    let w = `WHERE fcf.uuid = :uuid AND fcf.tenant_id = :tenant_id AND fcf.status = :status`;
    
    let groupBy = `GROUP BY fcf.id, u.id`;
  
    const categoryDetails = await sequelize.query(`${select} ${sql} ${w} ${groupBy}`, {
          replacements: { ...where, uuid, tenant_id, status, create_user_id },
          type: sequelize.QueryTypes.SELECT,
          plain: true,
    });
  
    return categoryDetails;
  
};

const moderateHold = async (request, where, transaction) => {
    const { formBuilder } = db();
    const { FormCustomField, FormCustomFieldProperty } = formBuilder;

  if (where.uuid === ":uuid") {
    throw customError("Invalid Input", "Please add form custom field uuid !");
  }

  let categoryId =   await getIdFromUUID(FormCustomField, { uuid: where.uuid });
  if (!categoryId) throw customError("Invalid_Input", `Incorrect form custom field id !`);

  const isExist = await FormCustomField.findOne({ where });
  if (!isExist) {
    return {
      message: `No form custom field found with this id`,
      status: 400,
    };
  }
  const [rowsUpdated, updatedCustomField] = await FormCustomField.update(
    { ...request },
    {
      where,
      returning: true, // This option allows the updated rows to be returned
      transaction
    }
  );

  if (rowsUpdated === 0) {
    throw customError("No rows were updated");
  }

  const updateCustomData = updatedCustomField[0].get({ plain: true });

  if(updateCustomData && updateCustomData.status === 0) {

    const getFormCustomProperty = await FormCustomFieldProperty.findAll({
      where: {
        form_custom_field_id: updateCustomData.id,
        status : ACTIVE
      },
      raw: true
    });

    if(getFormCustomProperty && getFormCustomProperty.length > 0) {

      const [propertyRowsUpdated, updatedFormProperty] = await FormCustomFieldProperty.update(
        { ...request },
        {
          where: { 
            form_custom_field_id :  updateCustomData.id,
            status : where.status
          },
          returning: true,
          transaction
        }
      );
    
      if (propertyRowsUpdated === 0) {
        throw customError("No form custom field property rows were updated");
      }
  
      await updatedFormProperty[0].get({ plain: true });

    }

  }

  return updateCustomData;
};

module.exports = {
  add,
  userLogin,
  getAll,
  getOne,
  moderate,
  getOneHHold,
  moderateHold
};