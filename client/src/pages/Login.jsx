// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/common/Icon";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    // Ensure email is lowercased to match backend storage
    const result = await login(email.toLowerCase(), password);

    if (result.success) {
      if (result.role === "student") navigate("/student/dashboard");
      else if (result.role === "admin") navigate("/admin/dashboard");
      else if (result.role === "server") navigate("/server/dashboard");
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
            <h1 className="font-serif-display text-3xl text-brand-text text-center mb-1">Welcome back</h1>
            <p className="text-xs text-brand-text-muted text-center mb-7">Sign in to your QLess account</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-text-faint tracking-wider">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#f5f7f5] border border-brand-border rounded-lg p-2.5 px-3.5 text-xs text-brand-text focus:outline-none focus:border-brand-green focus:bg-white transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-brand-text-faint tracking-wider">PASSWORD</label>
                  <a href="#" className="text-[11px] text-brand-green font-semibold">Forgot?</a>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <label className="flex items-center gap-2 text-xs text-brand-text-muted cursor-pointer mt-1">
                <input type="checkbox" className="accent-brand-green" /> Keep me signed in
              </label>

              <button type="submit" className="bg-brand-green text-white py-3.5 rounded-full font-bold text-sm border-0 cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-brand-green-dark hover:-translate-y-0.5 mt-2 disabled:opacity-75 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? "Signing In..." : 'Sign In'}
              </button>


            </form>

            <p className="text-center text-xs text-brand-text-muted mt-5">
              Don't have an account? <Link to="/register" className="text-brand-green font-semibold">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Support footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-brand-text-faint tracking-wider">SUPPORT &amp; TERMS</p>
          <div className="flex justify-center gap-4 mt-1.5 text-[11px] text-brand-text-faint">
            <a href="#" className="hover:text-brand-green">Contact</a>
            <a href="#" className="hover:text-brand-green">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-gradient-to-br from-[#f0f7eb] via-[#e8f5e0] to-[#f5f0e8] flex items-center justify-center p-10 overflow-hidden relative">
        <div className="bg-white rounded-[20px] shadow-lg overflow-hidden w-60 animate-float">
          <img src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80" alt="food" className="w-full h-full object-cover" />
          <div className="p-3.5 px-4">
            <p className="font-bold text-xs text-brand-text">Masala Dosa</p>
            <p className="text-[11px] text-brand-text-muted mt-0.5">290 cal · ₹60</p>
          </div>
        </div>
        <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-brand-text-faint leading-relaxed">
          Skip canteen rush with real-time updates.<br />
          Experience smarter campus dining today.
        </p>
      </div>
    </div>
  );
};

export default Login;
