import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Hash, Briefcase, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const RegisterScreen = () => {
    const navigate = useNavigate();
    const [selectedPosition, setSelectedPosition] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        employee_number: "",
        position: ""
    });
    const [focusedField, setFocusedField] = useState("");
    const API_BASE_URL = 'http://localhost:3000';
    const passwordRules = [
        { label: 'Minimum 12 characters', test: (value) => value.length >= 12 },
        { label: 'At least one uppercase letter', test: (value) => /[A-Z]/.test(value) },
        { label: 'At least one lowercase letter', test: (value) => /[a-z]/.test(value) },
        { label: 'At least one number', test: (value) => /[0-9]/.test(value) },
        { label: 'At least one special character (!@#$%^&*()_+-=[]{};\":|,.<>/?)', test: (value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) }
    ];

    const passwordErrors = formData.password
        ? passwordRules.filter((rule) => !rule.test(formData.password))
        : [];

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.username || !formData.password || !formData.employee_number || !formData.position) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (passwordErrors.length > 0) {
            setMessage({ type: 'error', text: 'Password does not meet the required rules.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    employee_number: formData.employee_number,
                    position: formData.position
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: formData.position.toLowerCase().includes('admin') 
                        ? 'Admin registration submitted! You can login immediately.' 
                        : 'Registration submitted! Await admin approval. You will be able to login once approved.' 
                });
                // Clear form after successful registration
                setFormData({
                    username: "",
                    password: "",
                    employee_number: "",
                    position: ""
                });
                setSelectedPosition("");
            } else {
                const errorText = Array.isArray(data.details)
                    ? data.details.join(' ')
                    : (data.message || 'Registration failed. Please try again.');
                setMessage({ type: 'error', text: errorText });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === "position") {
            setSelectedPosition(value);
        }
    };

    return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-900 via-blue-950 to-purple-900 relative overflow-x-hidden">
            {/* Animated Background Elements */}
           <div className="absolute inset-0 overflow-hidden">

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
            </div>



            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">

                <div className="w-full max-w-6xl mx-auto flex items-center justify-between lg:flex-row flex-col gap-8">
                    
                    {/* Left Side - Illustration/Info */}
                    <div className="lg:flex flex-col justify-center w-full lg:w-1/2 lg:pr-12" style={{animation: 'slideInLeft 1s ease-out'}}>
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                <UserPlus className="w-5 h-5 mr-2 text-cyan-300" />
                                <span className="text-sm font-medium">Registration</span>
                            </div>
                            
                            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                                Patient checkup management system
                                <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                    Base Hospital - Avissawella
                                </span>
                            </h1>
                            
                            {/* <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
                                Create your professional account and become part of our innovative healthcare platform. 
                                Experience seamless patient care management.
                            </p> */}
                            
                            {/* <div className="space-y-4">
                                {[
                                    "Secure professional verification",
                                    "Advanced patient management tools", 
                                    "Real-time collaboration features"
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                                        <span className="text-white/90">{feature}</span>
                                    </div>
                                ))}
                            </div> */}
                        </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="w-full lg:w-1/2 max-w-md mx-auto" style={{animation: 'slideInRight 1s ease-out'}}>
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-blue-200 shadow-2xl p-6 lg:p-8">
                            <div className="text-center mb-6 lg:mb-8" style={{animation: 'fadeInUp 1s ease-out 0.2s both'}}>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r bg-blue-600 rounded-2xl mb-4 shadow-lg">
                                    <UserPlus className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Create Account</h2>
                                <p className="text-white/70">Join our healthcare platform today</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4 lg:space-y-6">
                                {/* Username Field */}
                                <div style={{animation: 'fadeInUp 1s ease-out 0.3s both'}}>
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
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div style={{animation: 'fadeInUp 1s ease-out 0.4s both'}}>
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
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {formData.password && passwordErrors.length > 0 && (
                                        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3">
                                            <p className="text-xs font-semibold text-red-100 mb-2">Password requirements</p>
                                            <ul className="text-xs text-red-100/80 space-y-1">
                                                {passwordErrors.map((rule) => (
                                                    <li key={rule.label} className="flex items-start gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-300"></span>
                                                        <span>{rule.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Employee Number Field */}
                                <div style={{animation: 'fadeInUp 1s ease-out 0.5s both'}}>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Employee Number</label>
                                    <div className="relative">
                                        <Hash className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'employeeNumber' ? 'text-cyan-400' : 'text-white/50'
                                        }`} />
                                        <input
                                            type="text"
                                            value={formData.employee_number}
                                            onChange={(e) => handleInputChange('employee_number', e.target.value)}
                                            onFocus={() => setFocusedField('employee_number')}
                                            onBlur={() => setFocusedField('')}
                                            className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300"
                                            placeholder="Enter your employee number"
                                        />
                                    </div>
                                </div>

                                {/* Position Field */}
                                <div style={{animation: 'fadeInUp 1s ease-out 0.6s both'}}>
                                    <label className="block text-sm font-medium text-white/90 mb-2">Position</label>
                                    <div className="relative">
                                        <Briefcase className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'position' ? 'text-cyan-400' : 'text-white/50'
                                        }`} />
                                        <select
                                            value={selectedPosition}
                                            onChange={(e) => handleInputChange('position', e.target.value)}
                                            onFocus={() => setFocusedField('position')}
                                            onBlur={() => setFocusedField('')}
                                            className={`w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25 transition-all duration-300 ${
                                                selectedPosition ? "text-white" : "text-white/50"
                                            }`}
                                        >
                                            <option value="" disabled className="bg-gray-800 text-white/70">Select your position</option>
                                            <option value="Admin" className="bg-gray-800 text-white">Admin</option>
                                            <option value="Doctor" className="bg-gray-800 text-white">Doctor</option>
                                            <option value="Nurse" className="bg-gray-800 text-white">Nurse</option>
                                            <option value="Pharmacist" className="bg-gray-800 text-white">Pharmacist</option>
                                            <option value="Laboratorist" className="bg-gray-800 text-white">Laboratorist</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Message Display */}
                                {message.text && (
                                    <div style={{animation: 'fadeInUp 1s ease-out 0.7s both'}}>
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
                                    </div>
                                )}

                                {/* Register Button */}
                                <div style={{animation: 'fadeInUp 1s ease-out 0.8s both'}}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 lg:py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-2xl hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            ) : (
                                                <UserPlus className="w-5 h-5 mr-2" />
                                            )}
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </span>
                                    </button>
                                </div>

                                {/* Login Link */}
                                <div className="text-center" style={{animation: 'fadeInUp 1s ease-out 0.9s both'}}>
                                    <p className="text-white/70">
                                        Already have an account?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/loginScreen')}
                                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Sign In
                                        </button>
                                    </p>
                                </div>

                                {/* Admin Registration Link */}
                                <div className="text-center" style={{animation: 'fadeInUp 1s ease-out 1.0s both'}}>
                                    <p className="text-white/70">
                                        Need admin access?{" "}
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/admin-register')}
                                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Admin Registration
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;