// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/common/Icon";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import canteenImg from "../assets/canteenManagement.png";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (result.success) {
      if (result.role === "student") navigate("/student/dashboard");
      else if (result.role === "admin") navigate("/admin/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-brand-bg-warm">
      {/* Left panel */}
      <div className="flex-1 max-w-[520px] bg-white px-12 py-8 flex flex-col relative justify-between">
        <div>
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 bg-transparent border-0 text-brand-text-muted text-xs font-semibold cursor-pointer mb-8 transition-colors hover:text-brand-text">
            <ChevronLeft size={16} color="var(--text-muted)" />
            Back
          </button>

          <div className="flex-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-green to-brand-green-mid flex items-center justify-center text-white text-2xl font-bold font-serif-display">Q</div>
            </div>
            <h1 className="font-serif-display text-3xl text-brand-text text-center mb-1">Create account</h1>
            <p className="text-xs text-brand-text-muted text-center mb-7">Join QLess today</p>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-faint tracking-wider">FULL NAME</label>
                  <input 
                    type="text"
                    name="name"
                    placeholder="Divya Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-[#f5f7f5] border border-brand-border rounded-lg p-2.5 px-3.5 text-xs text-brand-text focus:outline-none focus:border-brand-green focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-faint tracking-wider">EMAIL ADDRESS</label>
                  <input 
                    type="email"
                    name="email"
                    placeholder="name@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-[#f5f7f5] border border-brand-border rounded-lg p-2.5 px-3.5 text-xs text-brand-text focus:outline-none focus:border-brand-green focus:bg-white transition-colors"
                  />
                </div>
              </div>



              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-faint tracking-wider">PASSWORD</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-[#f5f7f5] border border-brand-border rounded-lg p-2.5 px-3.5 pr-10 text-xs text-brand-text focus:outline-none focus:border-brand-green focus:bg-white transition-colors"
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer flex"
                      onClick={() => setShowPassword(p => !p)}
                    >
                      <Icon name={showPassword ? 'eyeoff' : 'eye'} size={16} color="var(--text-faint)" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-text-faint tracking-wider">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-[#f5f7f5] border border-brand-border rounded-lg p-2.5 px-3.5 pr-10 text-xs text-brand-text focus:outline-none focus:border-brand-green focus:bg-white transition-colors"
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer flex"
                      onClick={() => setShowConfirmPassword(p => !p)}
                    >
                      <Icon name={showConfirmPassword ? 'eyeoff' : 'eye'} size={16} color="var(--text-faint)" />
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="bg-brand-green text-white py-3.5 rounded-full font-bold text-sm border-0 cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-green-dark hover:-translate-y-0.5 mt-2 disabled:opacity-75 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? "Creating Account..." : 'Create Account'}
                <Icon name="arrow" size={15} color="#fff" />
              </button>
            </form>

            <p className="text-center text-xs text-brand-text-muted mt-5">
              Already have an account? <Link to="/login" className="text-brand-green font-semibold">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Support footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-brand-text-faint tracking-wider">© {new Date().getFullYear()} QLess. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-1.5 text-[11px] text-brand-text-faint">
            <a href="#" className="hover:text-brand-green">Privacy Policy</a>
            <a href="#" className="hover:text-brand-green">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-gradient-to-br from-[#f0f7eb] via-[#e8f5e0] to-[#f5f0e8] flex items-center justify-center p-10 overflow-hidden relative">
        <div className="bg-white rounded-[20px] shadow-lg overflow-hidden w-64 h-80 flex items-center justify-center p-2 animate-float">
          <img src={canteenImg} alt="canteen management" className="w-full h-full object-contain" />
        </div>
        <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-brand-text-faint leading-relaxed">
          Skip canteen rush with real-time updates.<br />
          Experience smarter campus dining today.
        </p>
      </div>
    </div>
  );
};

export default Register;
