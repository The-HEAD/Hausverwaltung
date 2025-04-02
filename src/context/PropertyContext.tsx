import type React from "react";
import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import type {
  Property,
  Apartment,
  Tenant,
  Contract,
  ID
} from "@/models/types";
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'web1_test1',
  password: '!Qayxsw2',
  database: 'web1_test'
};

const pool = mysql.createPool(dbConfig);

interface PropertyContextType {
  // Datenlisten
  properties: Property[];
  apartments: Apartment[];
  tenants: Tenant[];
  contracts: Contract[];

  // Funktionen für Häuser
  addProperty: (property: Omit<Property, "id">) => Property;
  updateProperty: (id: ID, property: Partial<Property>) => Property | null;
  deleteProperty: (id: ID) => boolean;
  getPropertyById: (id: ID) => Property | undefined;

  // Funktionen für Wohnungen
  addApartment: (apartment: Omit<Apartment, "id">) => Apartment;
  updateApartment: (id: ID, apartment: Partial<Apartment>) => Apartment | null;
  deleteApartment: (id: ID) => boolean;
  getApartmentById: (id: ID) => Apartment | undefined;
  getApartmentsByPropertyId: (propertyId: ID) => Apartment[];

  // Funktionen für Mieter
  addTenant: (tenant: Omit<Tenant, "id">) => Tenant;
  updateTenant: (id: ID, tenant: Partial<Tenant>) => Tenant | null;
  deleteTenant: (id: ID) => boolean;
  getTenantById: (id: ID) => Tenant | undefined;

  // Funktionen für Verträge
  addContract: (contract: Omit<Contract, "id">) => Contract;
  updateContract: (id: ID, contract: Partial<Contract>) => Contract | null;
  deleteContract: (id: ID) => boolean;
  getContractById: (id: ID) => Contract | undefined;
  getContractsByApartmentId: (apartmentId: ID) => Contract[];
  getContractsByTenantId: (tenantId: ID) => Contract[];
  getActiveContracts: () => Contract[];
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [apartments, setApartments] = useState<Apartment[]>(mockApartments);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);

  // Funktionen für Häuser
  const addProperty = (property: Omit<Property, "id">): Property => {
    const newProperty: Property = {
      ...property,
      id: generateId("prop")
    };
    setProperties([...properties, newProperty]);
    return newProperty;
  };

  const updateProperty = (id: ID, property: Partial<Property>): Property | null => {
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProperty = { ...properties[index], ...property };
    const updatedProperties = [...properties];
    updatedProperties[index] = updatedProperty;

    setProperties(updatedProperties);
    return updatedProperty;
  };

  const deleteProperty = (id: ID): boolean => {
    // Prüfen, ob es Wohnungen in diesem Haus gibt
    const hasApartments = apartments.some(apartment => apartment.propertyId === id);
    if (hasApartments) return false;

    setProperties(properties.filter(property => property.id !== id));
    return true;
  };

  const getPropertyById = (id: ID): Property | undefined => {
    return properties.find(property => property.id === id);
  };

  // Funktionen für Wohnungen
  const addApartment = (apartment: Omit<Apartment, "id">): Apartment => {
    const newApartment: Apartment = {
      ...apartment,
      id: generateId("apt")
    };
    setApartments([...apartments, newApartment]);
    return newApartment;
  };

  const updateApartment = (id: ID, apartment: Partial<Apartment>): Apartment | null => {
    const index = apartments.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updatedApartment = { ...apartments[index], ...apartment };
    const updatedApartments = [...apartments];
    updatedApartments[index] = updatedApartment;

    setApartments(updatedApartments);
    return updatedApartment;
  };

  const deleteApartment = (id: ID): boolean => {
    // Prüfen, ob es Verträge für diese Wohnung gibt
    const hasContracts = contracts.some(contract => contract.apartmentId === id);
    if (hasContracts) return false;

    setApartments(apartments.filter(apartment => apartment.id !== id));
    return true;
  };

  const getApartmentById = (id: ID): Apartment | undefined => {
    return apartments.find(apartment => apartment.id === id);
  };

  const getApartmentsByPropertyId = (propertyId: ID): Apartment[] => {
    return apartments.filter(apartment => apartment.propertyId === propertyId);
  };

  // Funktionen für Mieter
  const addTenant = (tenant: Omit<Tenant, "id">): Tenant => {
    const newTenant: Tenant = {
      ...tenant,
      id: generateId("tenant")
    };
    setTenants([...tenants, newTenant]);
    return newTenant;
  };

  const updateTenant = (id: ID, tenant: Partial<Tenant>): Tenant | null => {
    const index = tenants.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTenant = { ...tenants[index], ...tenant };
    const updatedTenants = [...tenants];
    updatedTenants[index] = updatedTenant;

    setTenants(updatedTenants);
    return updatedTenant;
  };

  const deleteTenant = (id: ID): boolean => {
    // Prüfen, ob es Verträge für diesen Mieter gibt
    const hasContracts = contracts.some(contract => contract.tenantId === id);
    if (hasContracts) return false;

    setTenants(tenants.filter(tenant => tenant.id !== id));
    return true;
  };

  const getTenantById = (id: ID): Tenant | undefined => {
    return tenants.find(tenant => tenant.id === id);
  };

  // Funktionen für Verträge
  const addContract = (contract: Omit<Contract, "id">): Contract => {
    const newContract: Contract = {
      ...contract,
      id: generateId("contract")
    };

    // Wohnung als belegt markieren
    const apartmentIndex = apartments.findIndex(a => a.id === contract.apartmentId);
    if (apartmentIndex !== -1) {
      const updatedApartment = { ...apartments[apartmentIndex], isOccupied: true };
      const updatedApartments = [...apartments];
      updatedApartments[apartmentIndex] = updatedApartment;
      setApartments(updatedApartments);
    }

    setContracts([...contracts, newContract]);
    return newContract;
  };

  const updateContract = (id: ID, contract: Partial<Contract>): Contract | null => {
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedContract = { ...contracts[index], ...contract };
    const updatedContracts = [...contracts];
    updatedContracts[index] = updatedContract;

    setContracts(updatedContracts);
    return updatedContract;
  };

  const deleteContract = (id: ID): boolean => {
    const contractToDelete = contracts.find(c => c.id === id);
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

    setContracts(contracts.filter(contract => contract.id !== id));
    return true;
  };

  const getContractById = (id: ID): Contract | undefined => {
    return contracts.find(contract => contract.id === id);
  };

  const getContractsByApartmentId = (apartmentId: ID): Contract[] => {
    return contracts.filter(contract => contract.apartmentId === apartmentId);
  };

  const getContractsByTenantId = (tenantId: ID): Contract[] => {
    return contracts.filter(contract => contract.tenantId === tenantId);
  };

  const getActiveContracts = (): Contract[] => {
    const today = new Date().toISOString().split('T')[0];
    return contracts.filter(contract =>
      !contract.endDate || contract.endDate >= today
    );
  };

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
