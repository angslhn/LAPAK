const SupplierModel = require('../models/supplier.model');

const { SUPPLIER_NOT_FOUND } = require('../helpers/error_codes');

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

    return { id: supplierId };
  } catch (err) {
    throw new Error(err.message);
  }
};

const update = async (data) => {
  try {
    const { id, ...fields } = data;

    const supplier = await SupplierModel.findById(id);

    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    await SupplierModel.update({ id, ...fields });
  } catch (err) {
    throw new Error(err.message);
  }
};

const remove = async (data) => {
  try {
    const { id } = data;

    const supplier = await SupplierModel.findById(id);

    if (!supplier) throw new Error(SUPPLIER_NOT_FOUND);

    await SupplierModel.remove(id);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, getById, create, update, remove };
