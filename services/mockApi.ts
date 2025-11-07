import { 
    UserRole, DailyRecord, Product, Staff, Invoice, Delivery, ConversionLog, DeliveryRoute, SalaryRecord
} from '../types';
import { PRODUCTS_LIST } from '../constants';

// --- MOCK DATABASE ---

const localDB = {
    get: <T>(key: string, defaultValue: T): T => {
        try {
            const stored = localStorage.getItem(`yd-mock-${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            console.error(`Error reading from localStorage key "${key}":`, e);
            return defaultValue;
        }
    },
    set: (key: string, data: any) => {
        try {
            localStorage.setItem(`yd-mock-${key}`, JSON.stringify(data));
        } catch (e) {
            console.error(`Error writing to localStorage key "${key}":`, e);
        }
    }
};

const initProducts = (): Product[] => {
    return PRODUCTS_LIST.map(p => ({
        ...p,
        stock: Math.floor(Math.random() * (p.unit === 'Ltr' ? 500 : 100)) + 20,
    }));
};

const initStaff = (): Staff[] => {
    return [
        { id: 'S001', name: 'Ramesh Kumar', role: 'Delivery', salary: 15000, password: 'password1' },
        { id: 'S002', name: 'Sita Devi', role: 'Counter Sales', salary: 12000, password: 'password2' },
        { id: 'S003', name: 'Mohan Singh', role: 'Production', salary: 18000, password: 'password3' },
        { id: 'S004', name: 'Geeta Sharma', role: 'Manager', salary: 25000, password: 'password4' },
        { id: 'S005', name: 'Arjun Reddy', role: 'Delivery', salary: 15500, password: 'password5' },
    ];
};

const initDeliveries = (): Delivery[] => {
    const staff = localDB.get<Staff[]>('staff', []);
    const deliveryStaff = staff.filter(s => s.role === 'Delivery');
    return [
        { id: 'D001', customerName: 'Anjali Verma', address: '123, Green Park, Delhi', status: 'Delivered', assignedTo: deliveryStaff[0]?.id || 'S001' },
        { id: 'D002', customerName: 'Raj Malhotra', address: '456, Civil Lines, Noida', status: 'Pending', assignedTo: deliveryStaff[1]?.id || 'S005' },
        { id: 'D003', customerName: 'Priya Singh', address: '789, MG Road, Gurgaon', status: 'Pending', assignedTo: deliveryStaff[0]?.id || 'S001' },
        { id: 'D004', customerName: 'Amit Patel', address: '101, Sector 15, Faridabad', status: 'Returned', reason: 'Customer not available', photo: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Door+Closed', assignedTo: deliveryStaff[1]?.id || 'S005' },
    ];
};

const initDailyRecords = (): DailyRecord[] => {
    const records: DailyRecord[] = [];
    for (let i = 365; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const counterSales = Math.floor(Math.random() * 5000) + 2000;
        const deliverySales = Math.floor(Math.random() * 8000) + 4000;
        const productsDelivered = Math.floor(Math.random() * 50) + 20;
        const productsPending = Math.floor(Math.random() * 10) + 2;
        const productsReturned = Math.floor(Math.random() * 5);
        records.push({
            date: date.toISOString().split('T')[0],
            totalSales: counterSales + deliverySales,
            counterSales,
            deliverySales,
            productsDelivered,
            productsPending,
            productsReturned,
        });
    }
    return records;
}

const productPrices: { [key: string]: number } = {
    'cow-milk': 50, 'buffalo-milk': 60, 'curd': 80, 'buttermilk': 40, 'buffalo-ghee': 600,
    'cow-ghee': 700, 'paneer': 350, 'butter': 500, 'mustard-oil': 150, 'mawa': 400, 'lassi': 50,
};

const initInvoices = (): Invoice[] => {
    return [
        {id: 'I001', customerName: 'Walk-in', date: new Date().toISOString().split('T')[0], items: [{productId: 'cow-milk', quantity: 2, price: 50}], total: 100, submittedBy: 'S002'}
    ];
}

const initConversionLogs = (): ConversionLog[] => {
    return [
        {id: 'C001', date: new Date().toISOString().split('T')[0], fromProduct: 'Cow Milk', fromQuantity: 50, toProduct: 'Paneer', toQuantity: 10, staffId: 'S003'}
    ];
}

const initDeliveryRoutes = (): DeliveryRoute[] => {
    return [
        { id: 'R001', name: 'South Delhi Route', staffId: 'S001', zone: 'Green Park, Hauz Khas, Saket' },
        { id: 'R002', name: 'Gurgaon Route', staffId: 'S005', zone: 'MG Road, Cyber City' }
    ];
}

const initSalaryRecords = (): SalaryRecord[] => {
    return [
        {id: 'SR001', staffId: 'S001', amount: 15000, paymentDate: new Date().toISOString().split('T')[0], forMonth: '2024-07'}
    ]
}


// Initialize Data
let products = localDB.get<Product[]>('products', initProducts());
let staff = localDB.get<Staff[]>('staff', initStaff());
let deliveries = localDB.get<Delivery[]>('deliveries', initDeliveries());
let dailyRecords = localDB.get<DailyRecord[]>('dailyRecords', initDailyRecords());
let invoices = localDB.get<Invoice[]>('invoices', initInvoices());
let conversionLogs = localDB.get<ConversionLog[]>('conversionLogs', initConversionLogs());
let deliveryRoutes = localDB.get<DeliveryRoute[]>('deliveryRoutes', initDeliveryRoutes());
let salaryRecords = localDB.get<SalaryRecord[]>('salaryRecords', initSalaryRecords());

let adminPassword = localDB.get<string>('adminPassword', 'admin123');
let passwordResetToken: { token: string; expiry: number } | null = null;

const saveData = () => {
    localDB.set('products', products);
    localDB.set('staff', staff);
    localDB.set('deliveries', deliveries);
    localDB.set('dailyRecords', dailyRecords);
    localDB.set('invoices', invoices);
    localDB.set('conversionLogs', conversionLogs);
    localDB.set('deliveryRoutes', deliveryRoutes);
    localDB.set('salaryRecords', salaryRecords);
    localDB.set('adminPassword', adminPassword);
};

// --- API FUNCTIONS ---

const simulateDelay = (delay = 500) => new Promise(res => setTimeout(res, delay));

export const login = async (id: string, pass: string): Promise<{ role: UserRole, user: Staff | {name: 'Admin'} | null }> => {
    await simulateDelay();
    if (id.toLowerCase() === 'admin' && pass === adminPassword) {
        return { role: 'admin', user: { name: 'Admin' } };
    }
    const staffMember = staff.find(s => s.id === id && s.password === pass);
    if (staffMember) {
        return { role: 'staff', user: staffMember };
    }
    return { role: null, user: null };
};

export const changeAdminPassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await simulateDelay();
    if (oldPass !== adminPassword) {
        return { success: false, message: "Incorrect current password." };
    }
    adminPassword = newPass;
    saveData();
    return { success: true, message: "Password updated successfully." };
};

export const requestAdminPasswordReset = async (adminId: string): Promise<{ success: boolean; message: string; token?: string }> => {
    await simulateDelay();
    if (adminId.toLowerCase() !== 'admin') {
        return { success: false, message: "Invalid admin ID." };
    }
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    passwordResetToken = { token, expiry: Date.now() + 300000 }; // 5-minute expiry
    return { success: true, message: `Token generated. It will expire in 5 minutes.`, token };
};

export const resetAdminPassword = async (token: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    await simulateDelay();
    if (!passwordResetToken || passwordResetToken.token !== token) {
        return { success: false, message: "Invalid or expired token." };
    }
    if (passwordResetToken.expiry < Date.now()) {
        passwordResetToken = null;
        return { success: false, message: "Token has expired." };
    }
    adminPassword = newPass;
    saveData();
    passwordResetToken = null;
    return { success: true, message: "Password reset successfully." };
};

export const getDeliveriesByStaff = async (staffId: string): Promise<Delivery[]> => {
    await simulateDelay();
    return deliveries.filter(d => d.assignedTo === staffId);
};

export const updateDelivery = async (updatedDelivery: Delivery): Promise<Delivery> => {
    await simulateDelay();
    const index = deliveries.findIndex(d => d.id === updatedDelivery.id);
    if (index > -1) {
        deliveries[index] = updatedDelivery;
        saveData();
        return updatedDelivery;
    }
    throw new Error("Delivery not found");
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'date' | 'total'>): Promise<Invoice> => {
    await simulateDelay();
    const newId = `I${String(invoices.length + 1).padStart(3, '0')}`;
    const itemsWithPrices = invoiceData.items.map(item => ({
        ...item,
        price: productPrices[item.productId] || 0,
    }));
    const total = itemsWithPrices.reduce((sum, item) => sum + item.quantity * item.price, 0);
    
    const newInvoice: Invoice = {
        ...invoiceData,
        id: newId,
        date: new Date().toISOString().split('T')[0],
        items: itemsWithPrices,
        total,
    };

    // Update stock
    newInvoice.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    invoices.unshift(newInvoice);
    saveData();
    return newInvoice;
}


// --- ADMIN PANEL APIs ---

export const getDashboardData = async (): Promise<{ dailyRecords: DailyRecord[]; deliveryStats: { delivered: number; pending: number; returned: number } }> => {
    await simulateDelay(800);
    const delivered = deliveries.filter(d => d.status === 'Delivered').length;
    const pending = deliveries.filter(d => d.status === 'Pending').length;
    const returned = deliveries.filter(d => d.status === 'Returned').length;
    return { dailyRecords, deliveryStats: { delivered, pending, returned } };
};

export const getProducts = async (): Promise<Product[]> => {
    await simulateDelay();
    return [...products];
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    await simulateDelay();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index > -1) {
        products[index] = updatedProduct;
        saveData();
        return updatedProduct;
    }
    throw new Error("Product not found");
};

export const getStaff = async (): Promise<Staff[]> => {
    await simulateDelay();
    return [...staff];
};

export const addStaff = async (newStaff: Omit<Staff, 'id'>): Promise<Staff> => {
    await simulateDelay();
    const newId = `S${String(staff.length + 1).padStart(3, '0')}`;
    const staffMember: Staff = { ...newStaff, id: newId };
    staff.push(staffMember);
    saveData();
    return staffMember;
};

export const updateStaffSalary = async (staffId: string, newSalary: number): Promise<Staff> => {
    await simulateDelay();
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
        staffMember.salary = newSalary;
        saveData();
        return staffMember;
    }
    throw new Error("Staff not found");
};

export const deleteStaff = async (staffId: string): Promise<{ success: boolean }> => {
    await simulateDelay();
    const initialLength = staff.length;
    staff = staff.filter(s => s.id !== staffId);
    if (staff.length < initialLength) {
        saveData();
        return { success: true };
    }
    throw new Error("Staff not found");
};

export const getDeliveries = async (): Promise<Delivery[]> => {
    await simulateDelay();
    return [...deliveries];
};

export const getInvoices = async (): Promise<Invoice[]> => {
    await simulateDelay();
    return [...invoices];
};

export const getConversionLogs = async (): Promise<ConversionLog[]> => {
    await simulateDelay();
    return [...conversionLogs];
};

export const addConversionLog = async (newLog: Omit<ConversionLog, 'id' | 'date'>): Promise<ConversionLog> => {
    await simulateDelay();
    const newId = `C${String(conversionLogs.length + 1).padStart(3, '0')}`;
    const log: ConversionLog = { ...newLog, id: newId, date: new Date().toISOString().split('T')[0] };
    
    // Update stock
    const fromProduct = products.find(p => p.name === newLog.fromProduct);
    const toProduct = products.find(p => p.name === newLog.toProduct);
    if (fromProduct && toProduct) {
        fromProduct.stock -= newLog.fromQuantity;
        toProduct.stock += newLog.toQuantity;
    }

    conversionLogs.unshift(log); // Add to top
    saveData();
    return log;
};

export const getDeliveryRoutes = async (): Promise<DeliveryRoute[]> => {
    await simulateDelay();
    return [...deliveryRoutes];
};

export const createDeliveryRoute = async (routeData: Omit<DeliveryRoute, 'id'>): Promise<DeliveryRoute> => {
    await simulateDelay();
    const newId = `R${String(deliveryRoutes.length + 1).padStart(3, '0')}`;
    const newRoute = { ...routeData, id: newId };
    deliveryRoutes.push(newRoute);
    saveData();
    return newRoute;
};

export const getSalaryRecords = async (): Promise<SalaryRecord[]> => {
    await simulateDelay();
    return [...salaryRecords];
};

export const paySalary = async (paymentData: Omit<SalaryRecord, 'id' | 'paymentDate'>): Promise<SalaryRecord> => {
    await simulateDelay();
    const newId = `SR${String(salaryRecords.length + 1).padStart(3, '0')}`;
    const newRecord: SalaryRecord = {
        ...paymentData,
        id: newId,
        paymentDate: new Date().toISOString().split('T')[0],
    };
    salaryRecords.unshift(newRecord);
    saveData();
    return newRecord;
};
