import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Eye, EyeOff, Shield } from "lucide-react";
import useAuth from "../utils/useAuth";

const LoginScreen = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [focusedField, setFocusedField] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotData, setForgotData] = useState({ username: '', employeeNumber: '' });
    const [forgotStatus, setForgotStatus] = useState('');
    const [loginError, setLoginError] = useState('');
    const API_BASE_URL = 'http://localhost:3000';
    const handleForgotChange = (field, value) => {
        setForgotData(prev => ({ ...prev, [field]: value }));
    };


  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotData.username.trim() || !forgotData.employeeNumber.trim()) {
      setForgotStatus("Please fill both fields.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotData),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotStatus("Request submitted. Await admin approval.");
        setForgotData({ username: "", employeeNumber: "" });
      } else {
        setForgotStatus(data.message || "Error submitting request.");
      }
    } catch (err) {
      setForgotStatus("Network error. Try again.");
    }
  };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        
        // Basic validation
        if (!formData.username.trim() || !formData.password.trim()) {
            setLoginError('Please enter both username and password');
            return;
        }

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
                // Login success: store user data and token
                console.log('Login successful:', data);
                setLoginError('');
                
                // Store token and user data using useAuth login function
                const role = data.staff.isAdmin ? 'admin' : 'staff';
                login(data.staff, data.token, role);
                
                // Check if user has temporary password
                if (data.staff.isPasswordTemporary) {
                    // Store user info for change password page
                    localStorage.setItem('needsPasswordChange', 'true');
                    alert('You are using a temporary password. You will be redirected to change your password.');
                    navigate('/change-password');
                    return;
                }
                
                // Navigate based on user role
                if (data.staff.isAdmin) {
                    navigate('/admin-dashboard'); // Admin dashboard
                } else {
                    navigate('/dashboard'); // Regular user dashboard
                }
            } else {
                // Show error message
                setLoginError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('Network error. Please try again.');
        }
    };


    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (loginError) {
            setLoginError('');
        }
    };

    const handleRegisterClick = () => {
        navigate('/registerScreen');
    };

    return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-900 via-blue-950 to-purple-900 relative overflow-x-hidden">
        {/* Forgot Password Modal */}
        {showForgotModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-500">Forgot Password</h3>
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-500">Username</label>
                            <input type="text" value={forgotData.username} onChange={e => handleForgotChange('username', e.target.value)} className="w-full border rounded px-3 py-2 text-gray-500 placeholder-gray-400" placeholder="Enter username" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-500">Employee Number</label>
                            <input type="text" value={forgotData.employeeNumber} onChange={e => handleForgotChange('employeeNumber', e.target.value)} className="w-full border rounded px-3 py-2 text-gray-500 placeholder-gray-400" placeholder="Enter employee number" required />
                        </div>
                        {forgotStatus && <div className="text-sm text-gray-500">{forgotStatus}</div>}
                        <div className="flex gap-2 mt-4">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
                            <button type="button" className="bg-gray-300 px-4 py-2 rounded text-gray-500" onClick={() => { setShowForgotModal(false); setForgotStatus(""); }}>Cancel</button>
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
                    
                    {/* Left Side - Welcome Info */}
                    <div className="lg:flex flex-col justify-center w-full lg:w-1/2 lg:pr-12">
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                <Shield className="w-5 h-5 mr-2 text-cyan-300" />
                                <span className="text-sm font-medium">Secure Healthcare Access</span>
                            </div>
                            
                            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                                Patient checkup management system
                                <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                    Base Hospital - Avissawella
                                </span>
                            </h1>
                            
                            {/* <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
                                Access your professional healthcare dashboard with enhanced security 
                                and seamless patient management tools.
                            </p>
                            
                            <div className="space-y-4">
                                {[
                                    "Secure authentication system",
                                    "Real-time patient data access", 
                                    "Collaborative healthcare tools"
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                                        <span className="text-white/90">{feature}</span>
                                    </div>
                                ))}
                            </div> */}
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-1/2 max-w-md mx-auto">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-blue-200 shadow-2xl p-6 lg:p-8">
                            <div className="text-center mb-6 lg:mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                                    <LogIn className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                                <p className="text-white/70">Sign in to your healthcare account</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
                                {/* Username Field */}
                                <div>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Username</label>
                                    <div className="relative">
                                        <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'username' ? 'text-cyan-400' : 'text-white/50'
                                        }`} />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField('')}
                                            className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'password' ? 'text-cyan-400' : 'text-white/50'
                                        }`} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField('')}
                                            className="w-full pl-12 pr-12 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {loginError && (
                                        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-100">
                                            {loginError}
                                        </div>
                                    )}
                                </div>

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Login Button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 lg:py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-2xl hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            <LogIn className="w-5 h-5 mr-2" />
                                            Sign In
                                        </span>
                                    </button>
                                </div>

                                {/* Register Link */}
                                <div className="text-center">
                                    <p className="text-white/70">
                                        Don't have an account?{" "}
                                        <button 
                                            type="button"
                                            onClick={handleRegisterClick}
                                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Create Account
                                        </button>
                                    </p>
                                </div>

                                {/* Admin Login Link */}
                                <div className="text-center">
                                    <p className="text-white/70">
                                        Administrator access?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/admin-login')}
                                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Admin Login
                                        </button>
                                    </p>
                                </div>

                                {/* Security Notice */}
                                <div className="text-center mt-6">
                                    <div className="inline-flex items-center px-3 py-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30">
                                        <Shield className="w-4 h-4 mr-2 text-green-400" />
                                        <span className="text-xs text-green-300">Secured with end-to-end encryption</span>
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

export default LoginScreen;