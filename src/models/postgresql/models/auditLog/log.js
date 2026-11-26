const { DataTypes } = require("sequelize");
const sequelize = require("../../../../configs/db.pg.config");

const Log = sequelize.define(
  "Log",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    table_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    module_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    submodule_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    record_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    records: {
        type: DataTypes.JSONB,
    },
    operation_type: {           
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
  },
  {
    tableName: "logs",
    timestamps: true,
  }
);

module.exports = Log;