import type { Apartment, Contract, Property, Tenant, ID } from "./types";

// Mock-Daten für Häuser
export const mockProperties: Property[] = [
  {
    id: "prop-1",
    name: "Stadtpark Residenz",
    address: "Parkstraße 12",
    city: "Berlin",
    postalCode: "10115",
    constructionYear: 2010,
    totalApartments: 8
  },
  {
    id: "prop-2",
    name: "Sonnenhof",
    address: "Sonnenallee 45",
    city: "München",
    postalCode: "80331",
    constructionYear: 2005,
    totalApartments: 12
  },
  {
    id: "prop-3",
    name: "Rheinblick",
    address: "Rheinuferstraße 78",
    city: "Köln",
    postalCode: "50667",
    constructionYear: 2015,
    totalApartments: 6
  }
];

// Mock-Daten für Wohnungen
export const mockApartments: Apartment[] = [
  {
    id: "apt-1",
    propertyId: "prop-1",
    number: "101",
    floor: 1,
    size: 65,
    rooms: 2,
    bathrooms: 1,
    price: 850,
    isOccupied: true,
    amenities: ["Balkon", "Keller", "Aufzug"]
  },
  {
    id: "apt-2",
    propertyId: "prop-1",
    number: "102",
    floor: 1,
    size: 45,
    rooms: 1,
    bathrooms: 1,
    price: 650,
    isOccupied: false,
    amenities: ["Keller"]
  },
  {
    id: "apt-3",
    propertyId: "prop-1",
    number: "201",
    floor: 2,
    size: 85,
    rooms: 3,
    bathrooms: 2,
    price: 1200,
    isOccupied: true,
    amenities: ["Balkon", "Keller", "Aufzug", "Einbauküche"]
  },
  {
    id: "apt-4",
    propertyId: "prop-2",
    number: "101",
    floor: 1,
    size: 70,
    rooms: 2,
    bathrooms: 1,
    price: 900,
    isOccupied: true,
    amenities: ["Balkon", "Keller", "Einbauküche"]
  },
  {
    id: "apt-5",
    propertyId: "prop-2",
    number: "102",
    floor: 1,
    size: 50,
    rooms: 1,
    bathrooms: 1,
    price: 700,
    isOccupied: true,
    amenities: ["Keller"]
  },
  {
    id: "apt-6",
    propertyId: "prop-3",
    number: "101",
    floor: 1,
    size: 90,
    rooms: 3,
    bathrooms: 2,
    price: 1300,
    isOccupied: false,
    amenities: ["Terrasse", "Keller", "Aufzug", "Einbauküche", "Garten"]
  }
];

// Mock-Daten für Mieter
export const mockTenants: Tenant[] = [
  {
    id: "tenant-1",
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.mustermann@example.com",
    phone: "0170 1234567",
    dateOfBirth: "1985-05-15",
    idNumber: "DE123456789"
  },
  {
    id: "tenant-2",
    firstName: "Anna",
    lastName: "Schmidt",
    email: "anna.schmidt@example.com",
    phone: "0160 9876543",
    dateOfBirth: "1990-08-21",
    idNumber: "DE987654321"
  },
  {
    id: "tenant-3",
    firstName: "Thomas",
    lastName: "Meyer",
    email: "thomas.meyer@example.com",
    phone: "0151 5554433",
    dateOfBirth: "1978-12-03",
    idNumber: "DE555444333"
  },
  {
    id: "tenant-4",
    firstName: "Julia",
    lastName: "Wagner",
    email: "julia.wagner@example.com",
    phone: "0176 1122334",
    dateOfBirth: "1995-03-28",
    idNumber: "DE112233445"
  }
];

// Mock-Daten für Verträge
export const mockContracts: Contract[] = [
  {
    id: "contract-1",
    apartmentId: "apt-1",
    tenantId: "tenant-1",
    startDate: "2022-01-01",
    endDate: "2024-12-31",
    rentalPrice: 850,
    deposit: 1700,
    isPaid: true,
    notes: "Langzeitmieter mit guter Zahlungsmoral"
  },
  {
    id: "contract-2",
    apartmentId: "apt-3",
    tenantId: "tenant-2",
    startDate: "2023-03-15",
    endDate: "2025-03-14",
    rentalPrice: 1200,
    deposit: 2400,
    isPaid: true,
    notes: "Mietvertrag mit Option auf Verlängerung"
  },
  {
    id: "contract-3",
    apartmentId: "apt-4",
    tenantId: "tenant-3",
    startDate: "2021-06-01",
    endDate: "2023-05-31",
    rentalPrice: 900,
    deposit: 1800,
    isPaid: true,
    notes: "Vertrag wurde bereits einmal verlängert"
  },
  {
    id: "contract-4",
    apartmentId: "apt-5",
    tenantId: "tenant-4",
    startDate: "2023-09-01",
    rentalPrice: 700,
    deposit: 1400,
    isPaid: true,
    notes: "Unbefristeter Mietvertrag"
  }
];

// Hilfsfunktion zur Generierung einer neuen ID
export const generateId = (prefix: string): ID => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
