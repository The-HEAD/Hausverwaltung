// Eindeutige ID für alle Entitäten
export type ID = string;

// Haus-Modell
export interface Property {
  id: ID;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  constructionYear?: number;
  totalApartments: number;
}

// Wohnungs-Modell
export interface Apartment {
  id: ID;
  propertyId: ID;
  number: string;
  floor: number;
  size: number; // in Quadratmetern
  rooms: number;
  bathrooms: number;
  price: number; // monatliche Miete
  isOccupied: boolean;
  amenities: string[];
}

// Mieter-Modell
export interface Tenant {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  idNumber?: string;
}

// Vertrag-Modell
export interface Contract {
  id: ID;
  apartmentId: ID;
  tenantId: ID;
  startDate: string;
  endDate?: string;
  rentalPrice: number;
  deposit: number;
  isPaid: boolean;
  documents?: string[];
  notes?: string;
}

// Status für Filter und Auswahl
export enum ContractStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  TERMINATING = "terminating",
  ALL = "all"
}
