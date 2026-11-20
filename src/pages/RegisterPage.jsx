import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { setUser } from '../utils/storage';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
    if (form.phone && !form.phone.match(/^\+?[\d\s\-]{10,15}$/)) e.phone = 'Enter a valid phone number';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    // Save to registered users
    const registered = JSON.parse(localStorage.getItem('biopay_registered_users') || '[]');
    if (registered.find(u => u.email === form.email)) {
      setErrors({ email: 'Email already registered. Please sign in.' });
      setLoading(false);
      return;
    }
    registered.push({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    localStorage.setItem('biopay_registered_users', JSON.stringify(registered));

    setUser({ id: 'user_' + Date.now(), name: form.name, email: form.email, phone: form.phone, biometricEnabled: false });
    navigate('/dashboard');
    setLoading(false);
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    return strength;
  };
  const strength = passwordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up py-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-black text-xl text-white">BioPay Nexus</div>
              <div className="text-cyan-400 text-xs">AI Fintech Platform</div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 text-sm mt-1">Start your secure payment journey</p>
        </div>

        <div className="glass-card p-8 border-gradient">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className={`input-field pl-10 ${errors.name ? 'border-red-500/50' : ''}`} placeholder="Alex Johnson" />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500/50' : ''}`} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Phone Number <span className="text-white/30">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className={`input-field pl-10 ${errors.phone ? 'border-red-500/50' : ''}`} placeholder="+91 98765 43210" />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500/50' : ''}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength !== null && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-white/40">{strengthLabels[strength]}</span>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))}
                  className={`input-field pl-10 ${errors.confirm ? 'border-red-500/50' : ''}`} placeholder="••••••••" />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Creating Account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-white/50 text-sm">Already have an account? </span>
            <Link to="/login" className="text-cyan-400 text-sm font-medium hover:text-cyan-300">Sign in</Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-white/30">
          🔒 Demo only. No real financial data stored.
        </div>
      </div>
    </div>
  );
}
