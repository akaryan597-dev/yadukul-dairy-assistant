
import React from 'react';
import { Product } from './types';

export const APP_NAME = "YADUKUL DAIRY";

export const PRODUCTS_LIST: Omit<Product, 'stock'>[] = [
  { id: 'cow-milk', name: 'Cow Milk', unit: 'Ltr', type: 'Cow Milk' },
  { id: 'buffalo-milk', name: 'Buffalo Milk', unit: 'Ltr', type: 'Buffalo Milk' },
  { id: 'curd', name: 'Curd (Dahi)', unit: 'Kg', type: 'Dairy Product' },
  { id: 'buttermilk', name: 'Butter Milk (Chaach)', unit: 'Ltr', type: 'Dairy Product' },
  { id: 'buffalo-ghee', name: 'Buffalo Ghee', unit: 'Kg', type: 'Dairy Product' },
  { id: 'cow-ghee', name: 'Cow Ghee', unit: 'Kg', type: 'Dairy Product' },
  { id: 'paneer', name: 'Paneer', unit: 'Kg', type: 'Dairy Product' },
  { id: 'butter', name: 'Butter (Desi Makhan)', unit: 'Kg', type: 'Dairy Product' },
  { id: 'mustard-oil', name: 'Farm Mustard Oil', unit: 'Ltr', type: 'Other' },
  { id: 'mawa', name: 'Mawa', unit: 'Kg', type: 'Dairy Product' },
  { id: 'lassi', name: 'Lassi', unit: 'Ltr', type: 'Dairy Product' },
];

export const STAFF_ROLES: string[] = ['Delivery', 'Counter Sales', 'Production', 'Manager'];

export const Icon = ({ path, className = "w-6 h-6" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);
