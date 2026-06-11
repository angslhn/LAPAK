const SupplierInput = require('./inputs/supplier.input');

const create = (data) => {
  const { name, phone, email, contact_person, address, note } = data;

  const checkName = SupplierInput.name(name);
  if (checkName) throw new Error(checkName);

  const checkPhone = SupplierInput.phone(phone);
  if (checkPhone) throw new Error(checkPhone);

  const checkEmail = SupplierInput.email(email);
  if (checkEmail) throw new Error(checkEmail);

  const checkContactPerson = SupplierInput.contactPerson(contact_person);
  if (checkContactPerson) throw new Error(checkContactPerson);

  const checkAddress = SupplierInput.address(address);
  if (checkAddress) throw new Error(checkAddress);

  const checkNote = SupplierInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const update = (data) => {
  const { id } = data;

  const checkId = SupplierInput.id(id);
  if (checkId) throw new Error(checkId);

  create(data);
};

module.exports = { create, update };
