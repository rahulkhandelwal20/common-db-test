const { Log } = require("../../models/postgresql/models");

const generateAuditLog = (oldData, newData) => {
  const changes = {};
  for (const key in newData) {
    if (
      newData[key] !== undefined &&
      oldData.hasOwnProperty(key) &&
      oldData[key] !== newData[key]
    ) {
      changes[key] = {
        old_value: oldData[key],
        new_value: newData[key]
      };
    }
  }

  return changes;
};

const saveAuditLog = async ({
  tableName,
  moduleName,
  submoduleName,
  recordId,
  oldData = {},
  newData = {},
  operationType,
  tenantId,
  userId,
  transaction
}) => {
  // Generate full record for INSERT, else diff
  let records = {};
  if (operationType === "INSERT") {
    for (const key in newData) {
      records[key] = {
        old_value: null,
        new_value: newData[key]
      };
    }
  } else {
    records = generateAuditLog(oldData, newData);
  }

  // Skip if nothing to log
  if (Object.keys(records).length === 0) return;

  // Create audit log
  const result = await Log.create({
    table_name: tableName,
    module_name: moduleName,
    submodule_name: submoduleName,
    record_id: recordId,
    records,
    operation_type: operationType,
    tenant_id: tenantId,
    create_user_id: userId,
    status: 1
  }, { transaction });

  return result;
};

module.exports = {
  generateAuditLog,
  saveAuditLog
};