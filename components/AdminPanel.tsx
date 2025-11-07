import React, { useState, useEffect, useCallback, FormEvent, ReactNode, useMemo, memo } from 'react';
import { DailyRecord, Product, Staff, Delivery, StaffRole, Invoice, ConversionLog, DeliveryRoute, SalaryRecord } from '../types';
import * as api from '../services/mockApi';
import { useToast } from '../hooks/useToast';
import { SalesChart, ProductStatusPieChart } from './charts';
import { Icon, STAFF_ROLES, PRODUCTS_LIST } from '../constants';

type AdminTab = 'dashboard' | 'inventory' | 'staff' | 'deliveries' | 'routes' | 'invoices' | 'conversions' | 'salaries' | 'settings';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'inventory': return <ProductManagement searchTerm={debouncedSearchTerm} />;
            case 'staff': return <StaffManagement searchTerm={debouncedSearchTerm} />;
            case 'deliveries': return <DeliveryManagement searchTerm={debouncedSearchTerm} />;
            case 'routes': return <DeliveryRoutes searchTerm={debouncedSearchTerm} />;
            case 'invoices': return <InvoiceManagement searchTerm={debouncedSearchTerm} />;
            case 'conversions': return <ConversionLogViewer searchTerm={debouncedSearchTerm} />;
            case 'salaries': return <SalaryManagement searchTerm={debouncedSearchTerm} />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    const tabs: { id: AdminTab; name: string; icon: string }[] = [
        { id: 'dashboard', name: 'Dashboard', icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3h16.5M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0018 3h-3.75m-3.75 0h-3.75m3.75 0V3m-3.75 0V3m0 0h-3.75" },
        { id: 'inventory', name: 'Inventory', icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" },
        { id: 'staff', name: 'Staff', icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12.375a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" },
        { id: 'deliveries', name: 'Deliveries', icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 003.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5a3.375 3.375 0 00-3.375-3.375H3.375m15.75 9V14.25-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 003.375-3.375H20.625" },
        { id: 'routes', name: 'Routes', icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
        { id: 'invoices', name: 'Customer Bills', icon: "M16.5 6a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18 17.25h-12v-1.5a3 3 0 013-3h6a3 3 0 013 3v1.5z" },
        { id: 'conversions', name: 'Conversions', icon: "M16.023 9.348h4.992v-.001a.75.75 0 01.75.75v3.666c0 .414-.336.75-.75.75h-4.992v1.023a.75.75 0 01-1.5 0v-1.023h-4.992a.75.75 0 01-.75-.75v-3.666a.75.75 0 01.75-.75h4.992v-.001a.75.75 0 011.5 0v.001z" },
        { id: 'salaries', name: 'Salaries', icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 010 1.5h-.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0a.75.75 0 01-.75-.75v-.75m0 0h-.75a.75.75 0 01-.75-.75V6m0 0a.75.75 0 01.75-.75h.75M16.5 18.75h-1.5a3.375 3.375 0 01-3.375-3.375V9.375m9.375 9.375c.621 0 1.125-.504 1.125-1.125V9.375M3 18.75m13.5 0v.001M3.375 12h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v4.5c0 .621.504 1.125 1.125 1.125z" },
        { id: 'settings', name: 'Settings', icon: "M9.594 3.94c.09-.542.56-1.003 1.11-1.226a9 9 0 11-2.22 0c.55.223 1.02.684 1.11 1.226zM12 9a3 3 0 100 6 3 3 0 000-6z" },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64">
                <div className="sticky top-8">
                    <div className="relative mb-4">
                         <input
                            type="text"
                            placeholder="Search anything..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <nav className="flex flex-row md:flex-col gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-slate-800 text-white shadow'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Icon path={tab.icon} className="w-5 h-5" />
                                <span className="hidden md:inline">{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>
            <main className="flex-1">
                {renderContent()}
            </main>
        </div>
    );
};


const Dashboard = () => {
    const [data, setData] = useState<{ dailyRecords: DailyRecord[], deliveryStats: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        api.getDashboardData().then(setData).finally(() => setLoading(false));
    }, []);

    const filteredRecords = useMemo(() => {
        if (!data) return [];
        if (timeRange === 0) return data.dailyRecords;
        return data.dailyRecords.slice(-timeRange);
    }, [data, timeRange]);

    if (loading) return <LoadingSpinner />;
    if (!data) return <div>No data available.</div>;

    // FIX: Provide a default object for latestRecord to prevent type errors when dailyRecords is empty.
    const latestRecord: Partial<DailyRecord> = data.dailyRecords[data.dailyRecords.length - 1] || { totalSales: 0, productsDelivered: 0, productsPending: 0, productsReturned: 0 };
    const summary = [
        { label: "Today's Total Sales", value: `₹${(latestRecord.totalSales || 0).toLocaleString('en-IN')}` },
        { label: "Products Delivered", value: latestRecord.productsDelivered || 0 },
        { label: "Products Pending", value: latestRecord.productsPending || 0 },
        { label: "Products Returned", value: latestRecord.productsReturned || 0 },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.map(item => (
                    <div key={item.label} className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                    </div>
                ))}
            </div>
             <div className="flex justify-end gap-2 my-4">
                {[7, 30, 90, 0].map(days => (
                    <button key={days} onClick={() => setTimeRange(days)} className={`px-3 py-1 text-sm rounded-md ${timeRange === days ? 'bg-slate-800 text-white' : 'bg-gray-200'}`}>
                        {days === 0 ? 'All Time' : `Last ${days} Days`}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={filteredRecords} />
                </div>
                <div>
                    {data.deliveryStats && <ProductStatusPieChart data={data.deliveryStats} />}
                </div>
            </div>
        </div>
    );
};

const ProductManagement = ({ searchTerm }: { searchTerm: string }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { showToast } = useToast();

    const fetchProducts = useCallback(() => {
        setLoading(true);
        api.getProducts().then(setProducts).finally(() => setLoading(false));
    }, []);

    useEffect(fetchProducts, [fetchProducts]);

    const handleUpdateStock = async (product: Product, newStock: number) => {
        try {
            await api.updateProduct({ ...product, stock: newStock });
            showToast('Stock updated successfully', 'success');
            fetchProducts();
        } catch {
            showToast('Failed to update stock', 'error');
        }
        setEditingProduct(null);
    };

    const filteredProducts = useMemo(() =>
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [products, searchTerm]
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h2>
            <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Stock</th><th className="p-3">Unit</th><th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3 text-gray-600">{p.type}</td>
                                <td className="p-3 font-semibold">{p.stock}</td>
                                <td className="p-3 text-gray-600">{p.unit}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => setEditingProduct(p)} className="text-blue-600 hover:underline">Update Stock</button>
                                </td>
                            </tr>
                        )) : (
                             <tr><td colSpan={5} className="text-center p-4 text-gray-500">No products found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {editingProduct && <StockEditModal product={editingProduct} onSave={handleUpdateStock} onCancel={() => setEditingProduct(null)} />}
        </div>
    );
};

const StockEditModal = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product, stock: number) => void, onCancel: () => void }) => {
    const [stock, setStock] = useState(product.stock);
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(product, stock);
    };

    return (
        <Modal title={`Update stock for ${product.name}`} onClose={onCancel}>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2">Current Stock: {product.stock} {product.unit}</label>
                <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-2 border rounded" autoFocus />
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">Save</button>
                </div>
            </form>
        </Modal>
    );
};

const StaffManagement = ({ searchTerm }: { searchTerm: string }) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const { showToast } = useToast();

    const fetchStaff = useCallback(() => {
        setLoading(true);
        api.getStaff().then(setStaff).finally(() => setLoading(false));
    }, []);

    useEffect(fetchStaff, [fetchStaff]);

    const handleSave = async (staffMember: Staff | Omit<Staff, 'id'>) => {
        try {
            if ('id' in staffMember) {
                // This is an update, but we are not implementing staff edits here beyond salary
            } else {
                await api.addStaff(staffMember);
                showToast('Staff added successfully', 'success');
            }
            fetchStaff();
        } catch {
            showToast('Failed to save staff', 'error');
        }
        setEditingStaff(null);
        setIsAdding(false);
    };
    
    const filteredStaff = useMemo(() =>
        staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())),
        [staff, searchTerm]
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Staff Management</h2>
                <button onClick={() => setIsAdding(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5"/> Add Staff
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                 <table className="w-full text-left">
                     <thead>
                        <tr className="border-b"><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Salary</th></tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length > 0 ? filteredStaff.map(s => (
                             <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{s.id}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3 text-gray-600">{s.role}</td><td className="p-3 text-gray-600">₹{s.salary?.toLocaleString('en-IN')}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center p-4 text-gray-500">No staff found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isAdding && <StaffModal onSave={handleSave} onCancel={() => setIsAdding(false)} />}
        </div>
    );
};

const StaffModal = ({ onSave, onCancel }: { onSave: (s: Omit<Staff, 'id'>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({ name: '', role: 'Delivery' as StaffRole, salary: 0, password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title="Add Staff" onClose={onCancel}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">{STAFF_ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select></div>
                <div><label className="block text-sm font-medium">Salary</label><input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                <div><label className="block text-sm font-medium">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">Save</button></div>
            </form>
        </Modal>
    );
};

const DeliveryManagement = ({ searchTerm }: { searchTerm: string }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.getDeliveries(), api.getStaff()]).then(([d, s]) => {
            setDeliveries(d);
            setStaff(s);
        }).finally(() => setLoading(false));
    }, []);

    const staffNameMap = useMemo(() => staff.reduce((acc, s) => ({...acc, [s.id]: s.name}), {} as Record<string, string>), [staff]);
    
    const filteredDeliveries = useMemo(() => deliveries.filter(d => 
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (staffNameMap[d.assignedTo] || '').toLowerCase().includes(searchTerm.toLowerCase())
      ), [deliveries, searchTerm, staffNameMap]);

    if (loading) return <LoadingSpinner />;

    const statusColor = { Pending: 'text-orange-500 bg-orange-100', Delivered: 'text-green-500 bg-green-100', Returned: 'text-red-500 bg-red-100' };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Delivery Tracking</h2>
            <div className="bg-white p-4 rounded-lg shadow">
                 <table className="w-full text-left">
                     <thead><tr className="border-b"><th className="p-3">ID</th><th className="p-3">Customer</th><th className="p-3">Assigned To</th><th className="p-3">Status</th><th className="p-3">Reason/Photo</th></tr></thead>
                    <tbody>
                        {filteredDeliveries.map(d => (
                             <tr key={d.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{d.id}</td>
                                <td className="p-3 font-medium">{d.customerName}</td>
                                <td className="p-3 text-gray-600">{staffNameMap[d.assignedTo] || d.assignedTo}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[d.status]}`}>{d.status}</span></td>
                                <td className="p-3 text-sm text-gray-500">
                                    {d.status === 'Returned' && (
                                        <div className="flex items-center gap-2">
                                            <span>{d.reason}</span>
                                            {d.photo && <img src={d.photo} alt="Return" className="w-10 h-10 rounded-md object-cover" />}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DeliveryRoutes = ({ searchTerm }: { searchTerm: string }) => {
    const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { showToast } = useToast();

    const fetchRoutes = useCallback(() => {
        setLoading(true);
        Promise.all([api.getDeliveryRoutes(), api.getStaff()])
            .then(([r, s]) => {
                setRoutes(r);
                setStaff(s.filter(st => st.role === 'Delivery'));
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(fetchRoutes, [fetchRoutes]);

    const handleSave = async (routeData: Omit<DeliveryRoute, 'id'>) => {
        try {
            await api.createDeliveryRoute(routeData);
            showToast('Route created successfully', 'success');
            fetchRoutes();
        } catch {
            showToast('Failed to create route', 'error');
        }
        setIsAdding(false);
    };

    const staffNameMap = useMemo(() => staff.reduce((acc, s) => ({...acc, [s.id]: s.name}), {} as Record<string, string>), [staff]);
    
    const filteredRoutes = useMemo(() => routes.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffNameMap[r.staffId] || '').toLowerCase().includes(searchTerm.toLowerCase())
      ), [routes, searchTerm, staffNameMap]);

    if (loading) return <LoadingSpinner />;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Delivery Routes</h2>
                <button onClick={() => setIsAdding(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg">Add Route</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                 <table className="w-full text-left">
                     <thead><tr className="border-b"><th className="p-3">Route Name</th><th className="p-3">Assigned To</th><th className="p-3">Zone</th><th className="p-3">Photo</th></tr></thead>
                    <tbody>
                        {filteredRoutes.map(r => (
                            <tr key={r.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{r.name}</td>
                                <td className="p-3">{staffNameMap[r.staffId] || r.staffId}</td>
                                <td className="p-3 text-gray-600">{r.zone}</td>
                                <td className="p-3">{r.photo && <img src={r.photo} alt={r.name} className="w-16 h-16 rounded-md object-cover" />}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
            {isAdding && <RouteModal staff={staff} onSave={handleSave} onCancel={() => setIsAdding(false)} />}
        </div>
    );
};

const RouteModal = ({ staff, onSave, onCancel }: { staff: Staff[], onSave: (data: Omit<DeliveryRoute, 'id'>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({ name: '', staffId: staff[0]?.id || '', zone: '', photo: '' });
    const { showToast } = useToast();

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, photo: reader.result as string}));
            };
            reader.onerror = () => showToast('Failed to read file', 'error');
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.staffId) {
            showToast('Please assign a staff member.', 'error');
            return;
        }
        onSave(formData);
    };

    return (
        <Modal title="Create New Route" onClose={onCancel}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label>Route Name</label><input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded" required /></div>
                <div><label>Assign To</label><select value={formData.staffId} onChange={e => setFormData(p => ({...p, staffId: e.target.value}))} className="w-full p-2 border rounded">{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label>Zone Description</label><input type="text" value={formData.zone} onChange={e => setFormData(p => ({...p, zone: e.target.value}))} className="w-full p-2 border rounded" required /></div>
                <div><label>Route Photo (Optional)</label><input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full p-2 border rounded" /></div>
                {formData.photo && <img src={formData.photo} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-md" />}
                <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">Create Route</button></div>
            </form>
        </Modal>
    );
};


const InvoiceManagement = ({ searchTerm }: { searchTerm: string }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    
    useEffect(() => {
        api.getInvoices().then(setInvoices).finally(() => setLoading(false));
    }, []);

    const customerTotals = useMemo(() => {
        return invoices.reduce((acc, inv) => {
            acc[inv.customerName] = (acc[inv.customerName] || 0) + inv.total;
            return acc;
        }, {} as Record<string, number>);
    }, [invoices]);
    
    const filteredInvoices = useMemo(() => invoices.filter(i => 
        i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())
      ), [invoices, searchTerm]);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Customer Bills</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(customerTotals).map(([name, total]) => (
                    <div key={name} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-xl font-bold text-blue-600">₹{total.toLocaleString('en-IN')}</p>
                    </div>
                ))}
            </div>
             <div className="bg-white p-4 rounded-lg shadow">
                 <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-3">ID</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3"></th></tr></thead>
                    <tbody>
                        {filteredInvoices.map(i => (
                            <tr key={i.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{i.id}</td>
                                <td className="p-3">{i.customerName}</td>
                                <td className="p-3">{i.date}</td>
                                <td className="p-3 font-semibold">₹{i.total.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-right"><button onClick={() => setViewingInvoice(i)} className="text-blue-600 hover:underline">View Details</button></td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
             {viewingInvoice && <InvoiceModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
        </div>
    );
};

const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) => {
    const productMap = useMemo(() => PRODUCTS_LIST.reduce((acc, p) => ({...acc, [p.id]: p.name}), {} as Record<string, string>), []);

    const handlePrint = () => {
        document.body.classList.add('printing');
        window.print();
        document.body.classList.remove('printing');
    };

    return (
        <Modal title={`Invoice #${invoice.id}`} onClose={onClose}>
            <div className="print-container">
                <div className="my-4">
                    <p><strong>Customer:</strong> {invoice.customerName}</p>
                    <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead><tr className="border-b"><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Price</th><th className="p-2 text-right">Subtotal</th></tr></thead>
                    <tbody>
                        {invoice.items.map((item, idx) => (
                            <tr key={idx} className="border-b"><td className="p-2">{productMap[item.productId]}</td><td className="p-2">{item.quantity}</td><td className="p-2">₹{item.price}</td><td className="p-2 text-right">₹{item.price * item.quantity}</td></tr>
                        ))}
                    </tbody>
                    <tfoot><tr><td colSpan={3} className="p-2 text-right font-bold">Total</td><td className="p-2 text-right font-bold">₹{invoice.total.toLocaleString('en-IN')}</td></tr></tfoot>
                </table>
            </div>
            <div className="flex justify-end gap-2 mt-6 no-print">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Close</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white rounded">Print</button>
            </div>
        </Modal>
    );
};

const ConversionLogViewer = ({ searchTerm }: { searchTerm: string }) => {
    const [logs, setLogs] = useState<ConversionLog[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.getConversionLogs(), api.getStaff()]).then(([l, s]) => {
            setLogs(l);
            setStaff(s);
        }).finally(() => setLoading(false));
    }, []);
    
    const staffNameMap = useMemo(() => staff.reduce((acc, s) => ({...acc, [s.id]: s.name}), {} as Record<string, string>), [staff]);

    const filteredLogs = useMemo(() => logs.filter(l => 
        l.toProduct.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (staffNameMap[l.staffId] || '').toLowerCase().includes(searchTerm.toLowerCase())
      ), [logs, searchTerm, staffNameMap]);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Conversion Logs</h2>
            <div className="bg-white p-4 rounded-lg shadow">
                 <table className="w-full text-left">
                     <thead><tr className="border-b"><th className="p-3">Date</th><th className="p-3">Conversion</th><th className="p-3">By Staff</th></tr></thead>
                     <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{new Date(log.date).toLocaleDateString()}</td>
                                <td className="p-3">{log.fromQuantity}L {log.fromProduct} &rarr; {log.toQuantity}Kg {log.toProduct}</td>
                                <td className="p-3">{staffNameMap[log.staffId] || log.staffId}</td>
                            </tr>
                        ))}
                     </tbody>
                 </table>
            </div>
        </div>
    );
};

const SalaryManagement = ({ searchTerm }: { searchTerm: string }) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [records, setRecords] = useState<SalaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([api.getStaff(), api.getSalaryRecords()]).then(([s, r]) => {
            setStaff(s);
            setRecords(r);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(fetchData, [fetchData]);
    
    const handleSalaryUpdate = async (staffId: string, salary: number) => {
        try {
            await api.updateStaffSalary(staffId, salary);
            showToast('Salary updated!', 'success');
            fetchData();
        } catch { showToast('Failed to update salary', 'error'); }
    };
    
    const handlePaySalary = async (staffId: string, amount: number, forMonth: string) => {
        try {
            await api.paySalary({ staffId, amount, forMonth });
            showToast('Payment successful!', 'success');
            fetchData();
        } catch { showToast('Payment failed', 'error'); }
    };

    const staffNameMap = useMemo(() => staff.reduce((acc, s) => ({...acc, [s.id]: s.name}), {} as Record<string, string>), [staff]);
    
    const filteredStaff = useMemo(() => staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())), [staff, searchTerm]);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Salary Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold mb-2">Set Staff Salaries</h3>
                    <div className="bg-white p-4 rounded-lg shadow space-y-3">
                        {filteredStaff.map(s => <SalaryInput key={s.id} staff={s} onSave={handleSalaryUpdate} />)}
                    </div>
                </div>
                <div>
                    <PaySalaryForm staff={staff} onPay={handlePaySalary} />
                </div>
            </div>
            <div className="mt-8">
                <h3 className="font-bold mb-2">Payment History</h3>
                <div className="bg-white p-4 rounded-lg shadow">
                    <table className="w-full text-left">
                        <thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Staff</th><th className="p-2">For Month</th><th className="p-2">Amount</th></tr></thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} className="border-b"><td className="p-2">{new Date(r.paymentDate).toLocaleDateString()}</td><td className="p-2">{staffNameMap[r.staffId]}</td><td className="p-2">{r.forMonth}</td><td className="p-2">₹{r.amount.toLocaleString()}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SalaryInput = memo(({ staff, onSave }: { staff: Staff, onSave: (id: string, salary: number) => void }) => {
    const [salary, setSalary] = useState(staff.salary || 0);
    return (
        <div className="flex items-center gap-2">
            <label className="flex-1">{staff.name}</label>
            <input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} className="p-1 border rounded w-24" />
            <button onClick={() => onSave(staff.id, salary)} className="px-3 py-1 bg-slate-100 text-sm rounded">Save</button>
        </div>
    );
});

const PaySalaryForm = ({ staff, onPay }: { staff: Staff[], onPay: (id: string, amount: number, month: string) => void }) => {
    const [staffId, setStaffId] = useState(staff[0]?.id || '');
    const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
    const selectedStaff = useMemo(() => staff.find(s => s.id === staffId), [staff, staffId]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedStaff && selectedStaff.salary) {
            onPay(staffId, selectedStaff.salary, month);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3">
             <h3 className="font-bold">Pay Salary</h3>
             <div><label>Staff Member</label><select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full p-2 border rounded">{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
             <div><label>For Month</label><input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full p-2 border rounded" /></div>
             <p>Amount: <span className="font-bold">₹{(selectedStaff?.salary || 0).toLocaleString()}</span></p>
             <button type="submit" className="w-full px-4 py-2 bg-slate-800 text-white rounded">Mark as Paid</button>
        </form>
    );
};

const Settings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { showToast } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", 'error');
            return;
        }
        const result = await api.changeAdminPassword(currentPassword, newPassword);
        if (result.success) {
            showToast(result.message, 'success');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } else {
            showToast(result.message, 'error');
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow max-w-md">
                <h3 className="font-bold mb-4">Change Admin Password</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label>Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded" required/></div>
                    <div><label>New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded" required/></div>
                    <div><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded" required/></div>
                    <button type="submit" className="w-full px-4 py-2 bg-slate-800 text-white rounded">Change Password</button>
                </form>
            </div>
        </div>
    );
};

const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children: ReactNode }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{title}</h3><button onClick={onClose} className="text-2xl">&times;</button></div>
            {children}
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-800"></div>
    </div>
);

export default AdminPanel;