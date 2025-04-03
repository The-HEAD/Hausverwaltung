import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db';
import { ID, Property, Apartment, Tenant, Contract } from './types';

interface PropertyModel extends Model<Property>, Property {}
export const PropertyModel = sequelize.define<PropertyModel>('Property', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  postalCode: DataTypes.STRING,
  constructionYear: DataTypes.INTEGER,
  totalApartments: DataTypes.INTEGER,
}, {
  tableName: 'Properties',
  timestamps: false,
});

interface ApartmentModel extends Model<Apartment>, Apartment {}
export const ApartmentModel = sequelize.define<ApartmentModel>('Apartment', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  propertyId: DataTypes.STRING,
  number: DataTypes.STRING,
  floor: DataTypes.INTEGER,
  size: DataTypes.INTEGER,
  rooms: DataTypes.INTEGER,
  bathrooms: DataTypes.INTEGER,
  price: DataTypes.INTEGER,
  isOccupied: DataTypes.BOOLEAN,
  amenities: DataTypes.STRING,
}, {
  tableName: 'Apartments',
  timestamps: false,
});

interface TenantModel extends Model<Tenant>, Tenant {}
export const TenantModel = sequelize.define<TenantModel>('Tenant', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  dateOfBirth: DataTypes.STRING,
  idNumber: DataTypes.STRING,
}, {
  tableName: 'Tenants',
  timestamps: false,
});

interface ContractModel extends Model<Contract>, Contract {}
export const ContractModel = sequelize.define<ContractModel>('Contract', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  apartmentId: DataTypes.STRING,
  tenantId: DataTypes.STRING,
  startDate: DataTypes.STRING,
  endDate: DataTypes.STRING,
  rentalPrice: DataTypes.INTEGER,
  deposit: DataTypes.INTEGER,
  isPaid: DataTypes.BOOLEAN,
  notes: DataTypes.STRING,
}, {
  tableName: 'Contracts',
  timestamps: false,
});
