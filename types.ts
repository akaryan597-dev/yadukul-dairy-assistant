
export type UserRole = 'admin' | 'staff' | null;

export interface DailyRecord {
  date: string;
  totalSales: number;
  counterSales: number;
  deliverySales: number;
  productsDelivered: number;
  productsPending: number;
  productsReturned: number;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  unit: 'Ltr' | 'Kg' | 'Pcs';
  type: 'Cow Milk' | 'Buffalo Milk' | 'Dairy Product' | 'Other';
}

export type StaffRole = 'Delivery' | 'Counter Sales' | 'Production' | 'Manager';

export interface Staff {
  id: string;
  name:string;
  role: StaffRole;
  password?: string;
  salary?: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  date: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  submittedBy: string;
}

export interface Delivery {
  id: string;
  customerName: string;
  address: string;
  status: 'Pending' | 'Delivered' | 'Returned';
  reason?: string;
  photo?: string; // base64 string
  assignedTo: string;
}

export interface ConversionLog {
    id: string;
    date: string;
    fromProduct: 'Cow Milk' | 'Buffalo Milk';
    fromQuantity: number;
    toProduct: string;
    toQuantity: number;
    staffId: string;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  staffId: string;
  zone: string;
  photo?: string; // base64 string
}

export interface SalaryRecord {
    id: string;
    staffId: string;
    amount: number;
    paymentDate: string;
    forMonth: string; // e.g., "2024-07"
}
