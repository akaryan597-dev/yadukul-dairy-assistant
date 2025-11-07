import React, { useState, FormEvent } from 'react';
import { UserRole, Staff } from './types';
import AdminPanel from './components/AdminPanel';
import StaffPanel from './components/StaffPanel';
import { ToastProvider, useToast } from './hooks/useToast';
import { APP_NAME, Icon } from './constants';
import * as api from './services/mockApi';

type User = Staff | { name: 'Admin' };

const ForgotPasswordModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStep] = useState(1); // 1 for request, 2 for reset
    const [adminId, setAdminId] = useState('admin');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const { showToast } = useToast();

    const handleRequestReset = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfo('');
        const result = await api.requestAdminPasswordReset(adminId);
        if (result.success) {
            setInfo(`A reset token has been generated: ${result.token}. Please use it to reset your password.`);
            setStep(2);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        setLoading(true);
        setError('');
        const result = await api.resetAdminPassword(token, newPassword);
        if (result.success) {
            showToast('Password reset successfully!', 'success');
            onClose();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Reset Admin Password</h2>
                {step === 1 ? (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <p className="text-sm text-gray-600">Enter the admin ID to receive a password reset token.</p>
                        <div>
                            <label htmlFor="adminId" className="block text-sm font-medium text-gray-700">Admin ID</label>
                            <input
                                type="text"
                                id="adminId"
                                value={adminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                                readOnly
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {info && <p className="text-blue-500 text-sm font-semibold">{info}</p>}
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 disabled:opacity-50">
                                {loading ? 'Requesting...' : 'Request Token'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                         {info && <p className="text-blue-500 text-sm font-semibold mb-4">{info}</p>}
                         <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700">Reset Token</label>
                            <input type="text" id="token" value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end gap-2">
                             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 disabled:opacity-50">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};


const Login = ({ onLogin }: { onLogin: (role: UserRole, user: User) => void }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await api.login(id, password);
            if (result.role && result.user) {
                onLogin(result.role, result.user as User);
                showToast('Login successful!', 'success');
            } else {
                setError('Invalid credentials. Please try again.');
                showToast('Invalid credentials', 'error');
            }
        } catch (err) {
            setError('An error occurred during login.');
            showToast('Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-slate-800">{APP_NAME}</h1>
                        <p className="text-gray-500">Dairy Management System</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700">Staff ID / Admin</label>
                            <input
                                type="text"
                                id="id"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., S001 or admin"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                                <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm text-blue-600 hover:underline">Forgot Password?</button>
                            </div>
                             <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 disabled:opacity-50"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
        </>
    );
};


const AppContent = () => {
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleLogin = (role: UserRole, loggedInUser: User) => {
        setUserRole(role);
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        setUserRole(null);
        setUser(null);
    };

    if (!userRole || !user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
         <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">{APP_NAME}</h1>
                     <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user.name}</span>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800">
                            <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {userRole === 'admin' ? <AdminPanel /> : <StaffPanel staff={user as Staff} />}
            </main>
        </div>
    );
}


const App = () => {
  return (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
  );
};

export default App;