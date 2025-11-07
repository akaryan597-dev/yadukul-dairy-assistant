import React, { useState, useEffect, useCallback, FormEvent, useRef, useMemo } from 'react';
import { Staff, Delivery, Product, ConversionLog } from '../types';
import * as api from '../services/mockApi';
import { useToast } from '../hooks/useToast';
import { Icon, PRODUCTS_LIST } from '../constants';

interface StaffPanelProps {
    staff: Staff;
}

const StaffPanel: React.FC<StaffPanelProps> = ({ staff }) => {
    const renderPanelByRole = () => {
        switch (staff.role) {
            case 'Delivery': return <DeliveryStaffView staff={staff} />;
            case 'Counter Sales': return <CounterSalesView staff={staff} />;
            case 'Production': return <ProductionView staff={staff} />;
            case 'Manager': return <ManagerView staff={staff} />;
            default: return <div>Your role does not have a specific panel.</div>;
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Staff Panel: {staff.role}</h2>
            {renderPanelByRole()}
        </div>
    );
};

const DeliveryStaffView: React.FC<StaffPanelProps> = ({ staff }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const watchId = useRef<number | null>(null);
    const { showToast } = useToast();

    const fetchDeliveries = useCallback(() => {
        setIsLoading(true);
        api.getDeliveriesByStaff(staff.id).then(setDeliveries).finally(() => setIsLoading(false));
    }, [staff.id]);

    useEffect(fetchDeliveries, [fetchDeliveries]);

    const handleStatusChange = async (delivery: Delivery, newStatus: 'Delivered' | 'Returned', reason?: string, photo?: string) => {
        try {
            await api.updateDelivery({ ...delivery, status: newStatus, reason, photo });
            showToast(`Delivery updated!`, 'success');
            fetchDeliveries();
        } catch {
            showToast('Failed to update status', 'error');
        }
        setEditingDelivery(null);
    };

    const startTracking = () => {
        if (navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => {
                    console.error("Error getting location", err);
                    showToast(`Error: ${err.message}`, 'error');
                    setIsTracking(false);
                },
                { enableHighAccuracy: true }
            );
            setIsTracking(true);
            showToast('Location tracking started!', 'success');
        } else {
            showToast('Geolocation is not supported by this browser.', 'error');
        }
    };

    const stopTracking = () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        setIsTracking(false);
        setLocation(null);
        showToast('Location tracking stopped.', 'info');
    };
    
    const filteredDeliveries = useMemo(() => deliveries.filter(d => 
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.address.toLowerCase().includes(searchTerm.toLowerCase())
      ), [deliveries, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-2">Real-time Location Tracking</h3>
                {!isTracking ? 
                    <button onClick={startTracking} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Start & Share Location</button> :
                    <button onClick={stopTracking} className="bg-red-600 text-white px-4 py-2 rounded-lg">Stop Sharing</button>
                }
                {location && (
                    <div className="mt-4">
                        <p className="text-sm">Current Location: {location.lat.toFixed(5)}, {location.lon.toFixed(5)}</p>
                        <iframe 
                            className="w-full h-64 rounded-lg mt-2"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon-0.01},${location.lat-0.01},${location.lon+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lon}`}
                        ></iframe>
                    </div>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Your Assigned Deliveries</h3>
                 <input type="text" placeholder="Search by customer or address..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-lg mb-4" />
                <div className="space-y-4">
                    {isLoading ? <p>Loading deliveries...</p> : filteredDeliveries.map(d => (
                        <div key={d.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{d.customerName} - <span className="font-normal text-gray-600">{d.address}</span></p>
                                <p className={`text-sm font-bold ${d.status === 'Pending' ? 'text-orange-500' : d.status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}>{d.status}</p>
                            </div>
                            {d.status === 'Pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleStatusChange(d, 'Delivered')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">Delivered</button>
                                    <button onClick={() => setEditingDelivery(d)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">Returned</button>
                                </div>
                            )}
                        </div>
                    ))}
                    {!isLoading && deliveries.length === 0 && <p>No deliveries assigned to you.</p>}
                </div>
            </div>
            {editingDelivery && <ReturnModal delivery={editingDelivery} onSave={handleStatusChange} onCancel={() => setEditingDelivery(null)} />}
        </div>
    );
};

const ReturnModal = ({ delivery, onSave, onCancel }: { delivery: Delivery, onSave: (d: Delivery, status: 'Returned', reason: string, photo: string) => void, onCancel: () => void }) => {
    const [reason, setReason] = useState('');
    const [photo, setPhoto] = useState('');
    const { showToast } = useToast();

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result as string);
            reader.onerror = () => showToast('Failed to read file', 'error');
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!reason) {
            showToast('Please provide a reason for the return.', 'error');
            return;
        }
        onSave(delivery, 'Returned', reason, photo);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Reason for Return: {delivery.customerName}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Reason</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border rounded" required></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Take Photo (Optional)</label>
                        <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    {photo ? 
                        <img src={photo} alt="Preview" className="w-32 h-32 object-cover rounded-md" /> :
                        <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center"><Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="w-16 h-16 text-gray-400"/></div>
                    }
                    <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">Submit Return</button></div>
                </form>
            </div>
        </div>
    );
};

const CounterSalesView: React.FC<StaffPanelProps> = ({ staff }) => {
    const [customerName, setCustomerName] = useState('Walk-in');
    // FIX: Add price to item type to match the Invoice interface required by createInvoice API.
    const [items, setItems] = useState<{ productId: string; quantity: number; price: number }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        api.getProducts().then(setProducts);
    }, []);

    const addItem = () => {
        setItems([...items, { productId: PRODUCTS_LIST[0].id, quantity: 1, price: 0 }]);
    };

    const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };
    
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const productPrices = useMemo(() => {
        return PRODUCTS_LIST.reduce((acc, p) => ({ ...acc, [p.id]: Math.floor(Math.random() * 500) + 50 }), {} as Record<string, number>);
    }, []);

    const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * (productPrices[item.productId] || 0), 0), [items, productPrices]);

    const handleCreateInvoice = async () => {
        if (items.length === 0) {
            showToast('Please add at least one item.', 'error');
            return;
        }
        try {
            await api.createInvoice({ customerName, items, submittedBy: staff.id });
            showToast('Invoice created successfully!', 'success');
            setCustomerName('Walk-in');
            setItems([]);
        } catch { showToast('Failed to create invoice.', 'error'); }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Counter Sales Terminal</h3>
            <div className="space-y-4 max-w-2xl mx-auto">
                <div>
                    <label>Customer Name</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded"/>
                </div>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <select value={item.productId} onChange={e => updateItem(index, 'productId', e.target.value)} className="flex-1 p-2 border rounded">
                            {PRODUCTS_LIST.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', Number(e.target.value))} className="w-20 p-2 border rounded"/>
                        <button onClick={() => removeItem(index)} className="text-red-500 p-2">&times;</button>
                    </div>
                ))}
                <button onClick={addItem} className="text-blue-600 text-sm">+ Add Item</button>
                <div className="text-right text-2xl font-bold">Total: ₹{total.toLocaleString()}</div>
                <button onClick={handleCreateInvoice} className="w-full bg-slate-800 text-white py-3 rounded-lg">Create Invoice</button>
            </div>
        </div>
    );
};

const ProductionView: React.FC<StaffPanelProps> = ({ staff }) => {
    const [fromProduct, setFromProduct] = useState<'Cow Milk' | 'Buffalo Milk'>('Cow Milk');
    const [fromQuantity, setFromQuantity] = useState(0);
    const [toProduct, setToProduct] = useState(PRODUCTS_LIST.find(p => p.type === 'Dairy Product')?.name || '');
    const [toQuantity, setToQuantity] = useState(0);
    const { showToast } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (fromQuantity <= 0 || toQuantity <= 0) {
            showToast('Quantities must be positive.', 'error');
            return;
        }
        try {
            await api.addConversionLog({ fromProduct, fromQuantity, toProduct, toQuantity, staffId: staff.id });
            showToast('Conversion logged successfully!', 'success');
            setFromQuantity(0); setToQuantity(0);
        } catch { showToast('Failed to log conversion.', 'error'); }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Log Milk Conversion</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>From Milk Type</label>
                    <select value={fromProduct} onChange={e => setFromProduct(e.target.value as any)} className="w-full p-2 border rounded">
                        <option>Cow Milk</option><option>Buffalo Milk</option>
                    </select>
                </div>
                 <div>
                    <label>Milk Quantity (Ltr)</label>
                    <input type="number" value={fromQuantity} onChange={e => setFromQuantity(Number(e.target.value))} className="w-full p-2 border rounded"/>
                </div>
                 <div>
                    <label>To Product</label>
                    <select value={toProduct} onChange={e => setToProduct(e.target.value)} className="w-full p-2 border rounded">
                        {PRODUCTS_LIST.filter(p => p.type === 'Dairy Product').map(p => <option key={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Product Quantity (Kg/Pcs)</label>
                    <input type="number" value={toQuantity} onChange={e => setToQuantity(Number(e.target.value))} className="w-full p-2 border rounded"/>
                </div>
                <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-lg">Log Conversion</button>
            </form>
        </div>
    );
};

const ManagerView: React.FC<StaffPanelProps> = ({ staff }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold mb-4">Manager's Overview</h3>
            <p className="text-gray-600">This panel is for managers. For full administrative control, please log in with the 'admin' ID.</p>
        </div>
    );
};

export default StaffPanel;