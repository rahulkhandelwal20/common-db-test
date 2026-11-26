"use strict";
 

// const { db, cilo } = require("../../models/postgresql/models");

const prop_types = [
  "workdrives",
  "tenants",
  "accounts",
  "projects",
  "opportunities",
  "leads",
  "contacts",
  "tasks",
  "estimations",
  "users",
  "changeOrdersTasks",
  "masterChangeOrdersTasks",
  "RFITasks",
  "submittalTasks",
  "quotes",
  "quoteTemplate",
  "bidder",
  "vendors",
  "materials",
  "punchlistTasks",
  "punchlistItemTasks",
  "assemblyEstimationMapping",
  "warehouse",
  "location",
  "inventory",
  "purchaseOrders",
  "signOut",
  "bringBack",
  "delivery",
  "receipt",
  "requisition",
  "internalTransfer",
  "inventoryAdjustment",
  "estimationStamps",
  "issueAgainstRequisition",
  "shopPull",
  "physicalCount",
  // "approvePhysicalCount",
  "space_items",
  "form",
  "signature",
  "SubmittalSchedulesTasks",
  "posOrder",
  "retailCustomers",
  "retailContacts",
  "partnerRequest",
  "retailWarehouse",
  "retailLocation",
  "retailInventory",
  "retailPurchaseOrders",
  "retailReceipt",
  "retailInternalTransfer",
  "retailInventoryAdjustment",
  "retailPhysicalCount",
  "retailVendors",
  "fieldProject",
  "posReturnInvoice",
  "workOrders",
  "masterBillOfMaterial",
  "billOfMaterial",
  "manufacturingOrder",
  "estimates",
  "inclusionExclusion",
  "formTemplate",
  "EstimationAI",
  "formAssignMapping",
  "formConditionMapping",
  "formCustomFieldProperty",
  "formCustomField",
  "formSectionQuestion",
  "formResponse",
  "formTemplateSection",
  "formTemplateLink",
  "formTemplateModuleMapping",
  "formTemplateShare",
  "formSectionPage",
  "inclusionExclusionTemplate",
  "groupManufacturingOrder",
  "supportTickets",
  "escalationTickets",
  "knowledgeBase",
  "accCompany",
  "accDepartment",
  "accIFRSException",
  "accChartOfAccount",
  "accIndustry",
  "accAccountCurrency",
  "accAccountGroup",
  "accSubLedgerControl",
  "accConsolidationGroup",
  "accConsolidationAccount",
  "accConsolidationMapping",
  "accCoaMapping",
  "accPeriod",
  "accBudget",
  "accBudgetItem",
  "accBatch",
  "accBatchItem",
  "accTransaction",
  "accTransactionItem",
  "posCustomerPaymentInvoice",
  "businessPartner",
  "vendorReturn",
  "accTaxCode",
  "accTaxJurisdictionRate",
  "accTaxAccountMapping",
  "accMemo",
  "accMemoItem",
  "accVendorAccount",
  "accManualPayment",
  "accManualPaymentInvoice",
  "accManualPaymentItem",
  "accCustomer",
  "accSurcharge",
  "accDunningRule",
  "accCustomerBank",
  "accCustomerEmail",
  "accCustomerSurchargeExemption",
  "accExempt",
  "accInterestRateConfig",
  "accTaxCustomerMapping",
  "estimationQuoteDetails"
];
 
const dbTables = [
  "directories",
  "tenants",
  "Accounts",
  "Projects",
  "Opportunities",
  "Leads",
  "Contacts",
  "Tasks",
  "Estimations",
  "users",
  "ChangeOrders",
  "ChangeOrders",
  "RFIs",
  "Submittals",
  "EstimationQuotes",
  "EstimationQuoteTemplates",
  "Bids",
  "vendors",
  "Materials",
  "Punchlists",
  "Punchlist_items",
  "assembly_estimation_mapping",
  "Warehouses",
  "Aisles",
  "Inventories",
  "PurchaseOrders",
  "SignOuts",
  "BringBacks",
  "Deliveries",
  "Receipts",
  "Requisitions",
  "InternalTransfers",
  "InventoryAdjustments",
  "tenants",
  "IssueAgainstRequisitions",
  "ShopPulls",
  "InventoryAdjustments",
  "SpaceItems",
  "Forms",
  "users",
  "SubmittalSchedules",
  "POSOrders",
  "RetailCustomers",
  "RetailContacts",
  "users",
  "RetailWarehouses",
  "RetailAisles",
  "RetailInventories",
  "RetailPurchaseOrders",
  "RetailReceipts",
  "RetailInternalTransfers",
  "RetailInventoryAdjustments",
  "RetailPhysicalCounts",
  "RetailVendors",
  "FieldProjects",
  "POSReturnOrders",
  "WorkOrders",
  "MasterBOMs",
  "BillOfMaterials",
  "ManufacturingOrders",
  "Estimates",
  "EstimationInclusionExclusion",
  "FormTemplates",
  "EstimationAIRequests",
  "FormAssignMappings",
  "FormConditionMappings",
  "FormCustomFieldProperties",
  "FormCustomFields",
  "FormSectionQuestions",
  "FormResponses",
  "FormTemplateSections",
  "FormTemplateLinks",
  "FormTemplateModuleMappings",
  "FormTemplateShares",
  "FormSectionPages",
  "EstimationInclusionExclusionTemplates",
  "MOGroups",
  "SupportTickets",
  "EscalationTickets",
  "KnowledgeBases",
  "AccCompanies",
  "AccDepartments",
  "AccIFRSExceptions",
  "AccChartOfAccounts",
  "AccIndustries",
  "AccAccountCurrencies",
  "AccAccountGroups",
  "AccSubLedgerControls",
  "AccConsolidationGroups",
  "AccConsolidationAccounts",
  "AccConsolidationMappings",
  "AccCoaMappings",
  "AccPeriods",
  "AccBudgets",
  "AccBudgetItems",
  "AccBatches",
  "AccBatchItems",
  "AccTransactions",
  "AccTransactionItems",
  "POSCustomerAccounts",
  "AccBusinessPartners",
  "VendorReturns",
  "AccTaxCodes",
  "AccTaxJurisdictionRates",
  "AccTaxAccountMappings",
  "AccMemos",
  "AccMemoItems",
  "AccVendorAccounts",
  "AccManualPayments",
  "AccManualPaymentInvoices",
  "AccManualPaymentItems",
  "AccCustomers",
  "AccSurcharges",
  "AccDunningRules",
  "AccCustomerBanks",
  "AccCustomerEmails",
  "AccCustomerSurchargeExemptions",
  "AccExempts",
  "AccInterestRateConfigs",
  "AccTaxCustomerMappings",
  "EstimationQuoteDetails"
];

const customError = (name, message) => {
  let error = new Error(message);
  error.name = name;
  return error;
};

const getPropTypeNum = (prop_type) => prop_types.indexOf(prop_type);

const  getValueByIndex = (index) => {
  if (index < 0 || index >= prop_types.length) {
    return -1;
  }
  return prop_types[index];
}

const getPropTypeModal = (prop_type) => {
  prop_type = prop_types.indexOf(prop_type);
  if (prop_type === -1) throw Error("incorrect prop_type");
  return dbTables[prop_type];
};

const getPropId = async (prop_type, prop_id, tenant_id, account_id) => {
  try {
    if(account_id){
      await cilo.setCurrentORM(account_id);
    }
    const { sequelize } = db();
    console.log(prop_type," step 1 ===============>>>>>>>>>")
    prop_type = getPropTypeNum(prop_type);
    console.log(prop_type, dbTables[prop_type], "step 2 =======================>>>>>>>>>>>")
    if (prop_type === -1) throw customError("not_found", "Invalid prop type");

    const table = dbTables[prop_type];
    let tenantCond = "";
    if (tenant_id) {
      tenantCond += `tenant_id=${tenant_id} AND `;
    }
    const propObject = await sequelize.query(`SELECT id FROM "${table}" WHERE ${tenantCond} uuid='${prop_id}'`, { type: sequelize.QueryTypes.SELECT });

    if (propObject.length === 0) throw customError("not_found", "Invalid prop id");
    return {
      prop_id: propObject[0].id,
      prop_type,
    };
  } catch (error) {
    throw error;
  }
};

const propWiseColumns = {
  projects: "name",
  RFITasks: "number",
  punchlistTasks: "pl_number",
  changeOrdersTasks: "co_number",
  masterChangeOrdersTasks: "co_number",
  submittalTasks: "sub_number",
  accounts: "name",
  opportunities: "name",
  leads: "name",
  contacts: "name",
  warehouse: "code",
  location: "code",
  purchaseOrders:"po_number",
  signOut:"so_number",
  bringBack:"bb_number",
  delivery:"de_number",
  receipt:"receipt_number",
  requisition:"rq_number",
  internalTransfer:"it_number",
  inventoryAdjustment:"ia_number",
  issueAgainstRequisition:"issue_rq_number",
  shopPull:"sp_number",
  physicalCount:"ia_number",
  vendors: "code",
  fieldProject: "project_number",
  vendorReturn:"vr_number",
};

const propWiseColumnsMulti = {
  fieldProject: ["project_number", "name"],
};

const getPropDetails = async (prop_type, prop_id, tenant_id) => {
  try {
    const { sequelize } = db(); 
    if (prop_type === -1) throw customError("not_found", "Invalid prop type");
    let column = propWiseColumns[prop_type];
    prop_type = getPropTypeNum(prop_type);
    const table = dbTables[prop_type];
    console.log(table, prop_type)
    let selectColumns = '';
    if(column){
       selectColumns += `${column}, id`;
    }else{
      
    const columnCheckQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = '${table}' AND column_name = 'name'
  `;

    const columnCheck = await sequelize.query(columnCheckQuery, {
      type: sequelize.QueryTypes.SELECT,
    });
     selectColumns += columnCheck.length > 0 ? `name, id` : `id`;
    }
    
    let tenantCond = "";
    if (tenant_id) {
      tenantCond += `tenant_id=${tenant_id} AND `;
    }
    const propObject = await sequelize.query(`SELECT  ${ selectColumns } FROM "${table}" WHERE ${tenantCond} uuid='${prop_id}'`, { type: sequelize.QueryTypes.SELECT });

    if (propObject.length === 0) throw customError("not_found", "Invalid prop id");
    return {
      prop_details: propObject[0][column] ?? propObject[0].id
    };
  } catch (error) {
    throw error;
  }
};

const getModuleDetails = async (name) => {
  const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  let moduleName;

  if (['accounts', 'opportunities', 'leads', 'contacts'].includes(name)) {
    moduleName = 'CRM';
  } else if (name === 'vendors') {
    moduleName = 'Vendors';
  } else if (name === 'tasks' || name == 'space_items') {
    moduleName = 'Task';
  } else if ([
    'submittalschedulestasks', 
    'punchlistitemtasks', 
    'submittaltasks', 
    'rfitasks', 
    'masterchangeorderstasks', 
    'changeorderstasks',
    'fieldproject', 
    'projects'
  ].includes(name)) {
    moduleName = 'Projects';
  } else if (name === 'materials') {
    moduleName = 'Materials';
  } else if ([
    'retailphysicalcount',
    'retailinventoryadjustment',
    'retailinternaltransfer',
    'retailreceipt',
    'retailpurchaseorders',
    'retailinventory',
    'retaillocation',
    'retailwarehouse',
    'partnerrequest',
    'retailcontacts',
    'retailcustomers',
    'inventory',
    'warehouse',
    'location',
    'purchaseorders',
    'signout',
    'bringback',
    'delivery',
    'receipt',
    'requisition',
    'internaltransfer',
    'inventoryadjustment'
  ].includes(name)) {
    moduleName = 'Inventory';
  } else {
    moduleName = null;
  }

  return {
    moduleName,
    subModuleName: capitalizeFirstLetter(name),
  };
};

const isExists = async (args) => {
  try {
    const { sequelize } = db();
    let table;
    const { model, tenant_id, name } = args;
    if (model !== "contacts") {
      const prop_type = getPropTypeNum(model);
      if (prop_type === -1) return { message: "incorrect prop_type" };
      table = dbTables[prop_type];
    } else {
      table = "Contacts";
    }

    return await sequelize.query(`SELECT id FROM "${table}" WHERE tenant_id=${tenant_id} AND name='${name}' AND status = 1 LIMIT 1`, { type: sequelize.QueryTypes.SELECT });
  } catch (error) {
    console.log(error, "error");
    return error;
  }
};

const getPropUuid = async (prop_type, prop_id, tenant_id) => {
  try {
    const { sequelize } = db();
    const table = dbTables[prop_type];
    prop_type = prop_types[prop_type];
    if (typeof prop_type !== "string") throw Error("something went wrong!!");
    const attributes = ["vendors", "Accounts", "Opportunities", "Leads", "Contacts", "Tasks", "Projects"].includes(table) ? `uuid , name` : `uuid`;
    const propObject = await sequelize.query(`SELECT ${attributes} FROM "${table}" WHERE id='${prop_id}'`, { type: sequelize.QueryTypes.SELECT });
    if (propObject.length === 0) throw Error("Invalid prop id.");
    console.log(table, prop_type, prop_id, "final ================>>>>>>")
    return {
      prop_id: propObject[0]?.uuid,
      prop_type,
      name: propObject[0]?.name || "",
    };
  } catch (error) {
    throw error;
  }
};

const getPropUuidById = async (prop_type, prop_id, tenant_id) => {
  try {
    const { sequelize } = db();
    const table = dbTables[prop_type];
    prop_type = prop_types[prop_type];
    if (typeof prop_type !== "string") throw Error("something went wrong!!");
    const attributes =  `uuid`;
    const propObject = await sequelize.query(`SELECT ${attributes} FROM "${table}" WHERE tenant_id=${tenant_id} AND id=${prop_id}`, { type: sequelize.QueryTypes.SELECT });
    if (propObject.length === 0) throw Error("Invalid prop id.");
    return propObject[0].uuid;
  } catch (error) {
    throw error;
  }
};

const getPropTypeStr = (prop_type_num) => prop_types[prop_type_num];

const getPropInfoById = async (prop_type, prop_id, tenant_id) => {
  try {
    const { sequelize } = db();
    if (typeof prop_type === "string") throw new Error("Something went wrong!!");

    const table = dbTables[prop_type];
    prop_type = prop_types[prop_type];
    let column = propWiseColumns[prop_type];

    let attributes = column ? `${column} as name, uuid` : `uuid`;
    if (!column) {
      const columnCheck = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'name'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      if (columnCheck.length > 0) attributes = `uuid, name`;
    }

    const propObject = await sequelize.query(
      `SELECT ${attributes} FROM "${table}" WHERE tenant_id=${tenant_id} AND id=${prop_id}`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (propObject.length === 0) throw new Error("Invalid prop id.");

    return propObject[0].name
      ? { uuid: propObject[0].uuid, name: propObject[0].name }
      : { uuid: propObject[0].uuid };
  } catch (error) {
    throw error;
  }
};

const getPropInfoWithTableName = async (prop_type, prop_id, tenant_id) => {
  try {
    const { sequelize } = db();

    if (prop_type === null || prop_id === null || typeof prop_type === "string") {
      return { uuid: null, name: null, table_name: null };
    };

    const table = dbTables[prop_type];
    prop_type = prop_types[prop_type];
    let column = propWiseColumns[prop_type];

    // let attributes = column ? `${column} as name, uuid` : `uuid`;
    // if (!column) {
    //   const columnCheck = await sequelize.query(
    //     `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'name'`,
    //     { type: sequelize.QueryTypes.SELECT }
    //   );
    //   if (columnCheck.length > 0) attributes = `uuid, name`;
    // }

    if (propWiseColumnsMulti[prop_type]) {
      column = propWiseColumnsMulti[prop_type];
    };

    let attributes = `uuid`;

    if (column) {
      if (Array.isArray(column)) {
        // multiple columns case
        const selectCols = column.map(col => `${col}`).join(", ");
        attributes = `${selectCols}, uuid`;

        // ensure name always available
        if (!column.includes("name")) {
          attributes += `, name`;
        }
      } else {
        // single column case (existing logic preserved)
        attributes = column ? `${column} as name, uuid` : `uuid`;
      }
    } else {
      const columnCheck = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'name'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      if (columnCheck.length > 0) attributes = `uuid, name`;
    }

    const propObject = await sequelize.query(
      `SELECT ${attributes} FROM "${table}" WHERE tenant_id=${tenant_id} AND id=${prop_id}`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (propObject.length === 0) {
      return { uuid: null, name: null, table_name: table || null };
    };

    const { uuid, name, ...extra } = propObject[0] || {};  //all dynamic columns here

    return {
      uuid: uuid || null,
      name: name || null,
      table_name: table || null,
      prop_type : prop_type || null,
      extra
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getPropId,
  getPropTypeNum,
  getValueByIndex,
  getPropTypeModal,
  ACTIVE: 1,
  ARCHIVE: 3,
  TRASH: 2,
  DELETE: 0,
  isExists,
  dbTables,
  getPropUuid,
  getPropTypeStr,
  getPropUuidById,
  getModuleDetails,
  getPropDetails,
  getPropInfoById,
  getPropInfoWithTableName
};