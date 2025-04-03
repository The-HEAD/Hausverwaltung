import type React from "react";
import { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from "react";
import type {
  Property,
  Apartment,
  Tenant,
  Contract,
  ID
} from "@/models/types";
import { PropertyModel, ApartmentModel, TenantModel, ContractModel } from "@/models/models";
import { Op } from "sequelize";
import * as PropertyService from "@/services/propertyService";

interface PropertyContextType {
  // Datenlisten
  properties: Property[];
  apartments: Apartment[];
  tenants: Tenant[];
  contracts: Contract[];

  // Funktionen für Häuser
  addProperty: (property: Omit<Property, "id">) => Promise<Property>;
  updateProperty: (id: ID, property: Partial<Property>) => Promise<Property | null>;
  deleteProperty: (id: ID) => Promise<boolean>;
  getPropertyById: (id: ID) => Promise<Property | undefined>;

  // Funktionen für Wohnungen
  addApartment: (apartment: Omit<Apartment, "id">) => Promise<Apartment>;
  updateApartment: (id: ID, apartment: Partial<Apartment>) => Promise<Apartment | null>;
  deleteApartment: (id: ID) => Promise<boolean>;
  getApartmentById: (id: ID) => Promise<Apartment | undefined>;
  getApartmentsByPropertyId: (propertyId: ID) => Promise<Apartment[]>;

  // Funktionen für Mieter
  addTenant: (tenant: Omit<Tenant, "id">) => Promise<Tenant>;
  updateTenant: (id: ID, tenant: Partial<Tenant>) => Promise<Tenant | null>;
  deleteTenant: (id: ID) => Promise<boolean>;
  getTenantById: (id: ID) => Promise<Tenant | undefined>;

  // Funktionen für Verträge
  addContract: (contract: Omit<Contract, "id">) => Promise<Contract>;
  updateContract: (id: ID, contract: Partial<Contract>) => Promise<Contract | null>;
  deleteContract: (id: ID) => Promise<boolean>;
  getContractById: (id: ID) => Promise<Contract | undefined>;
  getContractsByApartmentId: (apartmentId: ID) => Promise<Contract[]>;
  getContractsByTenantId: (tenantId: ID) => Promise<Contract[]>;
  getActiveContracts: () => Promise<Contract[]>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const data = await PropertyModel.findAll();
      setProperties(data);
    };
    fetchProperties();

    const fetchApartments = async () => {
      const data = await ApartmentModel.findAll();
      setApartments(data);
    };
    fetchApartments();

    const fetchTenants = async () => {
      const data = await TenantModel.findAll();
      setTenants(data);
    };
    fetchTenants();

    const fetchContracts = async () => {
      const data = await ContractModel.findAll();
      setContracts(data);
    };
    fetchContracts();
  }, []);

  // Funktionen für Häuser
  const generateId = useCallback((prefix: string): ID => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }, []);

  const addProperty = useCallback(async (property: Omit<Property, "id">): Promise<Property> => {
    const newProperty = await PropertyModel.create({
      ...property,
      id: generateId("prop"),
    });
    setProperties(properties => [...properties, newProperty]);
    return newProperty;
  }, [generateId, setProperties]);

  const updateProperty = useCallback(async (id: ID, property: Partial<Property>): Promise<Property | null> => {
    const propertyToUpdate = await PropertyModel.findByPk(id);
    if (!propertyToUpdate) {
      return null;
    }
    await propertyToUpdate.update(property);
    setProperties(properties => properties.map(p => (p.id === id ? { ...p, ...property } : p)));
    return propertyToUpdate;
  }, [setProperties]);

  const deleteProperty = useCallback(async (id: ID): Promise<boolean> => {
    // Prüfen, ob es Wohnungen in diesem Haus gibt
    const hasApartments = apartments.some(apartment => apartment.propertyId === id);
    if (hasApartments) return false;

    await PropertyModel.destroy({ where: { id } });
    setProperties(properties => properties.filter(property => property.id !== id));
    return true;
  }, [apartments, setProperties]);

  const getPropertyById = useCallback(async (id: ID): Promise<Property | undefined> => {
    const property = await PropertyModel.findByPk(id);
    return property ? property.get({ plain: true }) : undefined;
  }, []);

  // Funktionen für Wohnungen
  const addApartment = useCallback(async (apartment: Omit<Apartment, "id">): Promise<Apartment> => {
    const newApartment = await ApartmentModel.create({
      ...apartment,
      id: generateId("apt"),
    });
    setApartments(apartments => [...apartments, newApartment]);
    return newApartment;
  }, [generateId, setApartments]);

  const updateApartment = async (id: ID, apartment: Partial<Apartment>): Promise<Apartment | null> => {
    const apartmentToUpdate = await ApartmentModel.findByPk(id);
    if (!apartmentToUpdate) {
      return null;
    }
    await apartmentToUpdate.update(apartment);
    setApartments(apartments => apartments.map(a => (a.id === id ? { ...a, ...apartment } : a)));
    return apartmentToUpdate;
  }, [setApartments]);

  const deleteApartment = useCallback(async (id: ID): Promise<boolean> => {
    // Prüfen, ob es Verträge für diese Wohnung gibt
    const hasContracts = contracts.some(contract => contract.apartmentId === id);
    if (hasContracts) return false;

    await ApartmentModel.destroy({ where: { id } });
    setApartments(apartments => apartments.filter(apartment => apartment.id !== id));
    return true;
  }, [contracts, setApartments]);

  const getApartmentById = useCallback(async (id: ID): Promise<Apartment | undefined> => {
    const apartment = await ApartmentModel.findByPk(id);
    return apartment ? apartment.get({ plain: true }) : undefined;
  }, []);

  const getApartmentsByPropertyId = useCallback(async (propertyId: ID): Promise<Apartment[]> => {
    const apartments = await ApartmentModel.findAll({ where: { propertyId } });
    return apartments;
  }, []);

  // Funktionen für Mieter
  const addTenant = useCallback(async (tenant: Omit<Tenant, "id">): Promise<Tenant> => {
    const newTenant = await TenantModel.create({
      ...tenant,
      id: generateId("tenant"),
    });
    setTenants(tenants => [...tenants, newTenant]);
    return newTenant;
  }, [generateId, setTenants]);

  const updateTenant = useCallback(async (id: ID, tenant: Partial<Tenant>): Promise<Tenant | null> => {
    const tenantToUpdate = await TenantModel.findByPk(id);
    if (!tenantToUpdate) {
      return null;
    }
    await tenantToUpdate.update(tenant);
    setTenants(tenants => tenants.map(t => (t.id === id ? { ...t, ...tenant } : t)));
    return tenantToUpdate;
  }, [setTenants]);

  const deleteTenant = useCallback(async (id: ID): Promise<boolean> => {
    // Prüfen, ob es Verträge für diesen Mieter gibt
    const hasContracts = contracts.some(contract => contract.tenantId === id);
    if (hasContracts) return false;

    await TenantModel.destroy({ where: { id } });
    setTenants(tenants => tenants.filter(tenant => tenant.id !== id));
    return true;
  }, [contracts, setTenants]);

  const getTenantById = useCallback(async (id: ID): Promise<Tenant | undefined> => {
    const tenant = await TenantModel.findByPk(id);
    return tenant ? tenant.get({ plain: true }) : undefined;
  }, []);

  // Funktionen für Verträge
  const addContract = useCallback(async (contract: Omit<Contract, "id">): Promise<Contract> => {
    const newContract = await ContractModel.create({
      ...contract,
      id: generateId("contract"),
    });

    // Wohnung als belegt markieren
    const apartmentIndex = apartments.findIndex(a => a.id === contract.apartmentId);
    if (apartmentIndex !== -1) {
      const updatedApartment = { ...apartments[apartmentIndex], isOccupied: true };
      const updatedApartments = [...apartments];
      updatedApartments[apartmentIndex] = updatedApartment;
      setApartments(updatedApartments);
    }

    setContracts(contracts => [...contracts, newContract]);
    return newContract;
  }, [apartments, generateId, setApartments, setContracts]);

  const updateContract = useCallback(async (id: ID, contract: Partial<Contract>): Promise<Contract | null> => {
    const contractToUpdate = await ContractModel.findByPk(id);
    if (!contractToUpdate) {
      return null;
    }
    await contractToUpdate.update(contract);
    setContracts(contracts => contracts.map(c => (c.id === id ? { ...c, ...contract } : c)));
    return contractToUpdate;
  }, [setContracts]);

  const deleteContract = useCallback(async (id: ID): Promise<boolean> => {
    const contractToDelete = await ContractModel.findByPk(id);
    if (!contractToDelete) return false;

    // Prüfen, ob es weitere aktive Verträge für diese Wohnung gibt
    const hasOtherContracts = contracts.some(
      c => c.id !== id && c.apartmentId === contractToDelete.apartmentId && !c.endDate
    );

    // Wenn kein anderer aktiver Vertrag existiert, Wohnung als nicht belegt markieren
    if (!hasOtherContracts) {
      const apartmentIndex = apartments.findIndex(a => a.id === contractToDelete.apartmentId);
      if (apartmentIndex !== -1) {
        const updatedApartment = { ...apartments[apartmentIndex], isOccupied: false };
        const updatedApartments = [...apartments];
        updatedApartments[apartmentIndex] = updatedApartment;
        setApartments(updatedApartments);
      }
    }

    await ContractModel.destroy({ where: { id } });
    setContracts(contracts => contracts.filter(contract => contract.id !== id));
    return true;
  }, [apartments, contracts, setApartments, setContracts]);

  const getContractById = useCallback(async (id: ID): Promise<Contract | undefined> => {
    const contract = await ContractModel.findByPk(id);
    return contract ? contract.get({ plain: true }) : undefined;
  }, []);

  const getContractsByApartmentId = useCallback(async (apartmentId: ID): Promise<Contract[]> => {
    const contracts = await ContractModel.findAll({ where: { apartmentId } });
    return contracts;
  }, []);

  const getContractsByTenantId = useCallback(async (tenantId: ID): Promise<Contract[]> => {
    const contracts = await ContractModel.findAll({ where: { tenantId } });
    return contracts;
  }, []);

  const getActiveContracts = useCallback(async (): Promise<Contract[]> => {
    const today = new Date().toISOString().split('T')[0];
    const contracts = await ContractModel.findAll({
      where: {
        endDate: {
          [Op.gte]: today
        }
      }
    });
    return contracts;
  }, []);

  const value = {
    properties,
    apartments,
    tenants,
    contracts,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
    addApartment,
    updateApartment,
    deleteApartment,
    getApartmentById,
    getApartmentsByPropertyId,
    addTenant,
    updateTenant,
    deleteTenant,
    getTenantById,
    addContract,
    updateContract,
    deleteContract,
    getContractById,
    getContractsByApartmentId,
    getContractsByTenantId,
    getActiveContracts
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
};
