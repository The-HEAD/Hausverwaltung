import { PropertyModel, ApartmentModel, TenantModel, ContractModel } from "@/models/models";
import { ID, Property, Apartment, Tenant, Contract } from "@/models/types";
import { Op } from "sequelize";

export const addProperty = async (property: Omit<Property, "id">): Promise<Property> => {
  const newProperty = await PropertyModel.create(property);
  return newProperty;
};

export const updateProperty = async (id: ID, property: Partial<Property>): Promise<Property | null> => {
  const propertyToUpdate = await PropertyModel.findByPk(id);
  if (!propertyToUpdate) {
    return null;
  }
  await propertyToUpdate.update(property);
  return propertyToUpdate;
};

export const deleteProperty = async (id: ID): Promise<boolean> => {
  await PropertyModel.destroy({ where: { id } });
  return true;
};

export const getPropertyById = async (id: ID): Promise<Property | undefined> => {
  const property = await PropertyModel.findByPk(id);
  return property ? property.get({ plain: true }) : undefined;
};

export const addApartment = async (apartment: Omit<Apartment, "id">): Promise<Apartment> => {
    const newApartment = await ApartmentModel.create(apartment);
    return newApartment;
};

export const updateApartment = async (id: ID, apartment: Partial<Apartment>): Promise<Apartment | null> => {
    const apartmentToUpdate = await ApartmentModel.findByPk(id);
    if (!apartmentToUpdate) {
      return null;
    }
    await apartmentToUpdate.update(apartment);
    return apartmentToUpdate;
};

export const deleteApartment = async (id: ID): Promise<boolean> => {
    await ApartmentModel.destroy({ where: { id } });
    return true;
};

export const getApartmentById = async (id: ID): Promise<Apartment | undefined> => {
    const apartment = await ApartmentModel.findByPk(id);
    return apartment ? apartment.get({ plain: true }) : undefined;
};

export const getApartmentsByPropertyId = async (propertyId: ID): Promise<Apartment[]> => {
    const apartments = await ApartmentModel.findAll({ where: { propertyId } });
    return apartments;
};

export const addTenant = async (tenant: Omit<Tenant, "id">): Promise<Tenant> => {
    const newTenant = await TenantModel.create(tenant);
    return newTenant;
};

export const updateTenant = async (id: ID, tenant: Partial<Tenant>): Promise<Tenant | null> => {
    const tenantToUpdate = await TenantModel.findByPk(id);
    if (!tenantToUpdate) {
      return null;
    }
    await tenantToUpdate.update(tenant);
    return tenantToUpdate;
};

export const deleteTenant = async (id: ID): Promise<boolean> => {
    await TenantModel.destroy({ where: { id } });
    return true;
};

export const getTenantById = async (id: ID): Promise<Tenant | undefined> => {
    const tenant = await TenantModel.findByPk(id);
    return tenant ? tenant.get({ plain: true }) : undefined;
};

export const addContract = async (contract: Omit<Contract, "id">): Promise<Contract> => {
    const newContract = await ContractModel.create(contract);
    return newContract;
};

export const updateContract = async (id: ID, contract: Partial<Contract>): Promise<Contract | null> => {
    const contractToUpdate = await ContractModel.findByPk(id);
    if (!contractToUpdate) {
      return null;
    }
    await contractToUpdate.update(contract);
    return contractToUpdate;
};

export const deleteContract = async (id: ID): Promise<boolean> => {
    await ContractModel.destroy({ where: { id } });
    return true;
};

export const getContractById = async (id: ID): Promise<Contract | undefined> => {
    const contract = await ContractModel.findByPk(id);
    return contract ? contract.get({ plain: true }) : undefined;
};

export const getContractsByApartmentId = async (apartmentId: ID): Promise<Contract[]> => {
    const contracts = await ContractModel.findAll({ where: { apartmentId } });
    return contracts;
};

export const getContractsByTenantId = async (tenantId: ID): Promise<Contract[]> => {
    const contracts = await ContractModel.findAll({ where: { tenantId } });
    return contracts;
};

export const getActiveContracts = async (): Promise<Contract[]> => {
    const today = new Date().toISOString().split('T')[0];
    const contracts = await ContractModel.findAll({
      where: {
        endDate: {
          [Op.gte]: today
        }
      }
    });
    return contracts;
};
