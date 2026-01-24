import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Key, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Auto-populate username for users with temporary passwords
    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const needsPasswordChange = localStorage.getItem('needsPasswordChange');
        
        if (needsPasswordChange && user.username) {
            setFormData(prev => ({ ...prev, username: user.username }));
        }
    }, []);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:3000';

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear status when user starts typing
        if (status.message) {
            setStatus({ type: '', message: '' });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setStatus({ type: 'error', message: 'Username is required.' });
            return false;
        }
        if (!formData.currentPassword) {
            setStatus({ type: 'error', message: 'Current password is required.' });
            return false;
        }
        if (!formData.newPassword) {
            setStatus({ type: 'error', message: 'New password is required.' });
            return false;
        }
        if (formData.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            setStatus({ type: 'error', message: 'New password must be different from current password.' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/change-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ 
                    type: 'success', 
                    message: 'Password changed successfully! Redirecting to your dashboard...' 
                });
                setFormData({
                    username: '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                // Clear the temporary password flag
                localStorage.removeItem('needsPasswordChange');
                
                // Redirect to appropriate dashboard based on user role
                const userRole = localStorage.getItem('userRole');
                setTimeout(() => {
                    if (userRole === 'admin') {
                        navigate('/admin-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 2000);
            } else {
                setStatus({ 
                    type: 'error', 
                    message: data.message || 'Error changing password.' 
                });
            }
        } catch (error) {
            console.error('Change password error:', error);
            setStatus({ 
                type: 'error', 
                message: 'Network error. Please try again later.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-blue-900 via-blue-950 to-purple-900 relative overflow-x-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8">
                        {/* Header */}
                        <div className="text-center mb-6 lg:mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                                <Key className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Change Password</h2>
                            <p className="text-white/70">Update your temporary password</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className="w-full px-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                    placeholder="Enter your username"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Current Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        value={formData.currentPassword}
                                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                        placeholder="Enter your current/temporary password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                                        disabled={loading}
                                    >
                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={formData.newPassword}
                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                        placeholder="Enter your new password"
                                        disabled={loading}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                                        disabled={loading}
                                    >
                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                        placeholder="Confirm your new password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                                        disabled={loading}
                                    >
                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            

                            {/* Status Message */}
                            {status.message && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                                    status.type === 'success' 
                                        ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                                        : 'bg-red-500/20 border border-red-500/30 text-red-300'
                                }`}>
                                    {status.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                    <span className="text-sm font-medium">{status.message}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-2xl hover:from-blue-700 hover:to-cyan-700 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="relative z-10 flex items-center justify-center">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        ) : (
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                        )}
                                        {loading ? 'Changing Password...' : 'Change Password'}
                                    </span>
                                </button>
                            </div>

                            {/* Back to Login */}
                            <div className="text-center">
                                <button 
                                    type="button"
                                    onClick={() => navigate('/loginScreen')}
                                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer flex items-center justify-center mx-auto"
                                    disabled={loading}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;