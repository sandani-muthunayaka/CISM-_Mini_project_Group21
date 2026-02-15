import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Eye, EyeOff, Shield, Crown, AlertCircle, CheckCircle } from "lucide-react";
import useAuth from "../utils/useAuth";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [focusedField, setFocusedField] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotData, setForgotData] = useState({ username: '', employeeNumber: '' });
    const [forgotStatus, setForgotStatus] = useState('');
    const API_BASE_URL = 'http://localhost:3000';

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.username.trim() || !formData.password.trim()) {
            setMessage({ type: 'error', text: 'Please enter both username and password' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Debug: Log the response data
                console.log('Login response:', data);
                console.log('Staff data:', data.staff);
                console.log('isAdmin flag:', data.staff.isAdmin);
                
                // Check if user is admin
                const adminPositions = ['admin', 'administrator', 'system admin', 'admin user'];
                const isAdminByPosition = adminPositions.includes(data.staff.position.toLowerCase());
                
                if (!data.staff.isAdmin && !isAdminByPosition) {
                    setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
                    setLoading(false);
                    return;
                }

                // Store admin data with token using useAuth login function
                login(data.staff, data.token, 'admin');
                
                // Check if admin has temporary password
                if (data.staff.isPasswordTemporary) {
                    localStorage.setItem('needsPasswordChange', 'true');
                    setMessage({ type: 'success', text: 'Login successful! You will be redirected to change your temporary password.' });
                    setTimeout(() => {
                        navigate('/change-password');
                    }, 2000);
                    return;
                }
                
                setMessage({ type: 'success', text: 'Admin login successful!' });
                
                // Navigate to admin dashboard
                setTimeout(() => {
                    navigate('/admin-dashboard');
                }, 1000);
                
            } else {
                setMessage({ type: 'error', text: data.message || 'Login failed. Please check your credentials.' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear messages when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };

    const handleForgotChange = (field, value) => {
        setForgotData(prev => ({ ...prev, [field]: value }));
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        if (!forgotData.username.trim() || !forgotData.employeeNumber.trim()) {
            setForgotStatus('Please fill both fields.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(forgotData),
            });
            const data = await response.json();
            if (response.ok) {
                setForgotStatus('Request submitted. Await admin approval.');
                setForgotData({ username: '', employeeNumber: '' });
            } else {
                setForgotStatus(data.message || 'Error submitting request.');
            }
        } catch (err) {
            setForgotStatus('Network error. Try again.');
        }
    };

    const handleStaffLogin = () => {
        navigate('/loginScreen');
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-blue-900 relative overflow-x-hidden">
            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Admin Forgot Password</h3>
                        <form onSubmit={handleForgotSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
                                <input 
                                    type="text" 
                                    value={forgotData.username} 
                                    onChange={e => handleForgotChange('username', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                                    placeholder="Enter admin username" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Employee Number</label>
                                <input 
                                    type="text" 
                                    value={forgotData.employeeNumber} 
                                    onChange={e => handleForgotChange('employeeNumber', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                                    placeholder="Enter employee number" 
                                    required 
                                />
                            </div>
                            {forgotStatus && (
                                <div className={`text-sm p-2 rounded ${
                                    forgotStatus.includes('submitted') 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                    {forgotStatus}
                                </div>
                            )}
                            <div className="flex gap-2 mt-4">
                                <button 
                                    type="submit" 
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Submit Request
                                </button>
                                <button 
                                    type="button" 
                                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded text-gray-700 transition-colors" 
                                    onClick={() => { 
                                        setShowForgotModal(false); 
                                        setForgotStatus(""); 
                                        setForgotData({ username: '', employeeNumber: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-6xl mx-auto flex items-center justify-between lg:flex-row flex-col gap-8">
                    
                    {/* Left Side - Admin Info */}
                    <div className="lg:flex flex-col justify-center w-full lg:w-1/2 lg:pr-12">
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
                                <Crown className="w-5 h-5 mr-2 text-purple-300" />
                                <span className="text-sm font-medium">Administrator Access</span>
                            </div>
                            
                            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                                Admin Portal
                                <span className="block bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                                    Hospital Management System
                                </span>
                            </h1>

                        </div>
                    </div>

                    {/* Right Side - Admin Login Form */}
                    <div className="w-full lg:w-1/2 max-w-md mx-auto">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-purple-200/30 shadow-2xl p-6 lg:p-8">
                            <div className="text-center mb-6 lg:mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Admin Login</h2>
                                <p className="text-white/70">Access administrative dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
                                {/* Username Field */}
                                <div>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Admin Username</label>
                                    <div className="relative">
                                        <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'username' ? 'text-purple-400' : 'text-white/50'
                                        }`} />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField('')}
                                            className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300"
                                            placeholder="Enter admin username"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Admin Password</label>
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'password' ? 'text-purple-400' : 'text-white/50'
                                        }`} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField('')}
                                            className="w-full pl-12 pr-12 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300"
                                            placeholder="Enter admin password"
                                            disabled={loading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-purple-400 transition-colors duration-200"
                                            disabled={loading}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                        disabled={loading}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Message Display */}
                                {message.text && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl ${
                                        message.type === 'success' 
                                            ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                                            : 'bg-red-500/20 border border-red-500/30 text-red-300'
                                    }`}>
                                        {message.type === 'success' ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5" />
                                        )}
                                        <span className="text-sm font-medium">{message.text}</span>
                                    </div>
                                )}

                                {/* Login Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 lg:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-2xl hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            ) : (
                                                <LogIn className="w-5 h-5 mr-2" />
                                            )}
                                            {loading ? 'Signing In...' : 'Admin Sign In'}
                                        </span>
                                    </button>
                                </div>

                                {/* Staff Login Link */}
                                <div className="text-center">
                                    <p className="text-white/70">
                                        Not an admin?{" "}
                                        <button 
                                            type="button"
                                            onClick={handleStaffLogin}
                                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                            disabled={loading}
                                        >
                                            Staff Login
                                        </button>
                                    </p>
                                </div>

                                {/* Create Admin Account Link */}
                                <div className="text-center">
                                    <p className="text-white/70">
                                        Need to create initial admin?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/admin-register')}
                                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                            disabled={loading}
                                        >
                                            Register Admin
                                        </button>
                                    </p>
                                </div>

                                {/* Security Notice */}
                                <div className="text-center mt-6">
                                    <div className="inline-flex items-center px-3 py-2 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-400/30">
                                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                                        <span className="text-xs text-purple-300">Enhanced security for administrators</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;