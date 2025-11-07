
import React from 'react';
import { DailyRecord } from '../types';

declare global {
    interface Window {
        Recharts: any;
    }
}

interface SalesChartProps {
    data: DailyRecord[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    // Wait for Recharts to be available on the window object.
    if (!window.Recharts) {
        return <div className="w-full h-80 bg-white p-4 rounded-lg shadow flex justify-center items-center">Loading Chart...</div>;
    }
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;

    const chartData = data.slice(-30).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        "Total Sales": d.totalSales,
        "Counter Sales": d.counterSales,
        "Delivery Sales": d.deliverySales,
    }));

    return (
        <div className="w-full h-80 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}/>
                    <Legend />
                    <Line type="monotone" dataKey="Total Sales" stroke="#0f172a" strokeWidth={2} />
                    <Line type="monotone" dataKey="Counter Sales" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="Delivery Sales" stroke="#84a9ff" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface ProductStatusPieChartProps {
    data: {
        delivered: number;
        pending: number;
        returned: number;
    }
}

export const ProductStatusPieChart: React.FC<ProductStatusPieChartProps> = ({ data }) => {
    // Wait for Recharts to be available on the window object.
    if (!window.Recharts) {
        return <div className="w-full h-80 bg-white p-4 rounded-lg shadow flex justify-center items-center">Loading Chart...</div>;
    }
    const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = window.Recharts;

    const pieData = [
        { name: 'Delivered', value: data.delivered },
        { name: 'Pending', value: data.pending },
        { name: 'Returned', value: data.returned },
    ];
    const COLORS = ['#22c55e', '#f97316', '#ef4444'];
    return (
        <div className="w-full h-80 bg-white p-4 rounded-lg shadow">
             <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Delivery Status</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
