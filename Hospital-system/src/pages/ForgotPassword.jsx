import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  User,
  IdCard,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { updateEmail } from "../services/staff/Staff";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    employeeNumber: "",
  });
  const [userType, setUserType] = useState("staff"); // 'staff' or 'admin'
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:3000";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear status when user starts typing
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username.trim() ||
      !formData.employeeNumber.trim() ||
      !formData.email.trim()
    ) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          employeeNumber: formData.employeeNumber,
          userType: userType,
        }),
      });

      const updatedEmailResponse = await updateEmail(
        formData.username,
        formData.email,
      );
      if (!updatedEmailResponse.success) {
        setStatus({ type: "error", message: updatedEmailResponse.message });
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message:
            "Password reset request submitted successfully! Please wait for admin approval. You will receive an email with your temporary password.",
        });
        setFormData({ username: "", employeeNumber: "" });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Error submitting password reset request.",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setStatus({
        type: "error",
        message: "Network error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (userType === "admin") {
      navigate("/admin-login");
    } else {
      navigate("/loginScreen");
    }
  };

  return (
    <div
      className={`min-h-screen w-screen relative overflow-x-hidden ${
        userType === "admin"
          ? "bg-gradient-to-br from-purple-900 via-indigo-950 to-blue-900"
          : "bg-gradient-to-br from-blue-900 via-blue-950 to-purple-900"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${
            userType === "admin"
              ? "from-purple-400 to-pink-400"
              : "from-cyan-400 to-blue-400"
          } rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse`}
        ></div>
        <div
          className={`absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r ${
            userType === "admin"
              ? "from-indigo-400 to-purple-400"
              : "from-purple-400 to-pink-400"
          } rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000`}
        ></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-6 lg:mb-8">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 ${
                  userType === "admin"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                    : "bg-blue-600"
                } rounded-2xl mb-4 shadow-lg`}
              >
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Forgot Password
              </h2>
              <p className="text-white/70">Request a password reset</p>
            </div>

            {/* User Type Toggle */}
            <div className="mb-6">
              <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUserType("staff")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    userType === "staff"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("admin")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    userType === "admin"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {userType === "admin" ? "Admin Username" : "Username"}
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      userType === "admin" ? "text-purple-400" : "text-cyan-400"
                    }`}
                  />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={`w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none transition-all duration-300 ${
                      userType === "admin"
                        ? "focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25"
                        : "focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25"
                    }`}
                    placeholder={`Enter your ${userType === "admin" ? "admin " : ""}username`}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Employee Number Field */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Employee Number
                </label>
                <div className="relative">
                  <IdCard
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      userType === "admin" ? "text-purple-400" : "text-cyan-400"
                    }`}
                  />
                  <input
                    type="text"
                    value={formData.employeeNumber}
                    onChange={(e) =>
                      handleInputChange("employeeNumber", e.target.value)
                    }
                    className={`w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none transition-all duration-300 ${
                      userType === "admin"
                        ? "focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25"
                        : "focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25"
                    }`}
                    placeholder="Enter your employee number"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* {userType !== "admin" && ( */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <IdCard
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      userType === "admin" ? "text-purple-400" : "text-cyan-400"
                    }`}
                  />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 outline-none transition-all duration-300 ${
                      userType === "admin"
                        ? "focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25"
                        : "focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/25"
                    }`}
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              {/* )} */}

              {/* Status Message */}
              {status.message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl ${
                    status.type === "success"
                      ? "bg-green-500/20 border border-green-500/30 text-green-300"
                      : "bg-red-500/20 border border-red-500/30 text-red-300"
                  }`}
                >
                  {status.type === "success" ? (
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
                  className={`w-full py-3 lg:py-4 text-white font-semibold rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
                    userType === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Submitting..." : "Submit Request"}
                  </span>
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className={`${
                    userType === "admin"
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-cyan-400 hover:text-cyan-300"
                  } font-medium transition-colors duration-200 hover:underline bg-transparent border-none cursor-pointer flex items-center justify-center mx-auto`}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to {userType === "admin" ? "Admin " : ""}Login
                </button>
              </div>

              {/* Security Notice */}
              <div className="text-center mt-6">
                <div
                  className={`inline-flex items-center px-3 py-2 backdrop-blur-sm rounded-lg border ${
                    userType === "admin"
                      ? "bg-purple-500/20 border-purple-400/30"
                      : "bg-green-500/20 border-green-400/30"
                  }`}
                >
                  <Shield
                    className={`w-4 h-4 mr-2 ${
                      userType === "admin"
                        ? "text-purple-400"
                        : "text-green-400"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      userType === "admin"
                        ? "text-purple-300"
                        : "text-green-300"
                    }`}
                  >
                    Requests require admin approval
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
