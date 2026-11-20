import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { setUser } from '../utils/storage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Demo login
    const demoAccounts = [
      { email: 'alex@biopay.demo', password: 'Demo@1234', name: 'Alex Johnson', phone: '+91 98765 43210' },
      { email: 'demo@biopay.demo', password: 'Demo@1234', name: 'Demo User', phone: '+91 00000 00000' },
    ];

    // Check registered users
    const registered = JSON.parse(localStorage.getItem('biopay_registered_users') || '[]');
    const all = [...demoAccounts, ...registered];
    const found = all.find(u => u.email === form.email && u.password === form.password);

    if (found) {
      setUser({ id: 'user_' + Date.now(), name: found.name, email: found.email, phone: found.phone, biometricEnabled: false });
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Try alex@biopay.demo / Demo@1234');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to your secure dashboard</p>
        </div>

        <div className="glass-card p-8 border-gradient">
          {/* Demo hint */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 mb-6 flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-cyan-300">
              <strong>Demo credentials:</strong><br />
              Email: alex@biopay.demo &nbsp; Password: Demo@1234
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="input-field pl-10"
                  placeholder="alex@biopay.demo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-white/50 text-sm">Don't have an account? </span>
            <Link to="/register" className="text-cyan-400 text-sm font-medium hover:text-cyan-300">Create one</Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-white/30">
          🔒 This is a demo platform. No real financial data is processed.
        </div>
      </div>
    </div>
  );
}
