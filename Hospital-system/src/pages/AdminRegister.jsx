import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Hash, Crown, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react";

const AdminRegister = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        employee_number: ""
    });
    const [focusedField, setFocusedField] = useState("");
    const [createInitialAdmin, setCreateInitialAdmin] = useState(false);
    const API_BASE_URL = 'http://localhost:3000';

    const handleCreateInitialAdmin = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/admin/create-initial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: `Initial admin created! Username: ${data.credentials.username}, Password: ${data.credentials.password}. Please change password after login.` 
                });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to create initial admin.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.username || !formData.password || !formData.employee_number) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/admin/staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    employee_number: formData.employee_number,
                    position: 'Admin'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: 'Admin account created successfully! You can now login immediately.' 
                });
                // Clear form after successful registration
                setFormData({
                    username: "",
                    password: "",
                    employee_number: ""
                });
            } else {
                setMessage({ type: 'error', text: data.message || 'Registration failed. Please try again.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
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

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-blue-900 relative overflow-x-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-6xl mx-auto flex items-center justify-between lg:flex-row flex-col gap-8">
                    
                    {/* Left Side - Info */}
                    <div className="lg:flex flex-col justify-center w-full lg:w-1/2 lg:pr-12">
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/30">
                                <Crown className="w-5 h-5 mr-2 text-purple-300" />
                                <span className="text-sm font-medium">Admin Account Creation</span>
                            </div>
                            
                            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                                Create Admin Account
                                <span className="block bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                                    Hospital Management System
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="w-full lg:w-1/2 max-w-md mx-auto">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-purple-200/30 shadow-2xl p-6 lg:p-8">
                            <div className="text-center mb-6 lg:mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Admin Registration</h2>
                                <p className="text-white/70">Create your administrative account</p>
                            </div>
                            <form onSubmit={handleRegister} className="space-y-4 lg:space-y-6">
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
                                            placeholder="Enter secure password"
                                            disabled={loading}
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

                                {/* Employee Number Field */}
                                <div>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Admin Employee Number</label>
                                    <div className="relative">
                                        <Hash className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'employee_number' ? 'text-purple-400' : 'text-white/50'
                                        }`} />
                                        <input
                                            type="text"
                                            value={formData.employee_number}
                                            onChange={(e) => handleInputChange('employee_number', e.target.value)}
                                            onFocus={() => setFocusedField('employee_number')}
                                            onBlur={() => setFocusedField('')}
                                            className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300"
                                            placeholder="Enter admin employee number"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Message Display */}
                                {message.text && (
                                    <div className={`flex items-start gap-2 p-3 rounded-xl ${
                                        message.type === 'success' 
                                            ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                                            : 'bg-red-500/20 border border-red-500/30 text-red-300'
                                    }`}>
                                        {message.type === 'success' ? (
                                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className="text-sm font-medium">{message.text}</span>
                                    </div>
                                )}

                                {/* Register Button */}
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
                                                <UserPlus className="w-5 h-5 mr-2" />
                                            )}
                                            {loading ? 'Creating Account...' : 'Create Admin Account'}
                                        </span>
                                    </button>
                                </div>

                                {/* Login Link */}
                                <div className="text-center">
                                    <p className="text-white/70">
                                        Already have an admin account?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/admin-login')}
                                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                            disabled={loading}
                                        >
                                            Admin Login
                                        </button>
                                    </p>
                                </div>

                                {/* Staff Registration Link */}
                                <div className="text-center">
                                    <p className="text-white/70">
                                        Need to register as staff?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/registerScreen')}
                                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                            disabled={loading}
                                        >
                                            Staff Registration
                                        </button>
                                    </p>
                                </div>

                                {/* Security Notice */}
                                <div className="text-center mt-6">
                                    <div className="inline-flex items-center px-3 py-2 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-400/30">
                                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                                        <span className="text-xs text-purple-300">Admin accounts have full system access</span>
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

export default AdminRegister;