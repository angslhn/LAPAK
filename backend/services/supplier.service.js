const SupplierModel = require('../models/supplier.model');

const {
  SUPPLIER_NOT_FOUND,
  SUPPLIER_UPDATE_FAILED,
  SUPPLIER_DELETE_FAILED,
} = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await SupplierModel.findAll();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (data) => {
  try {
    const { id } = data;

    const supplier = await SupplierModel.findById(id);

    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    return supplier;
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  try {
    const { name, phone, email, contact_person, address, note } = data;

    const supplierId = await SupplierModel.create({
      name,
      phone,
      email,
      contact_person,
      address,
      note,
    });

    return supplierId;
  } catch (err) {
    throw new Error(err.message);
  }
};

const update = async (data) => {
  try {
    const { id, ...fields } = data;

    const supplier = await SupplierModel.findById(id);

    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    const affectedRows = await SupplierModel.update({ id, ...fields });

    if (affectedRows === 0) throw new Error(SUPPLIER_UPDATE_FAILED);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const remove = async (data) => {
  try {
    const { id } = data;

    const supplier = await SupplierModel.findById(id);

    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    const affectedRows = await SupplierModel.remove(id);

    if (affectedRows === 0) throw new Error(SUPPLIER_DELETE_FAILED);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, getById, create, update, remove };
