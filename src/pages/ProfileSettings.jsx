import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Fingerprint, Shield, Smartphone, Mail, Lock,
  CheckCircle, AlertCircle, RefreshCw, Key, Bell, Sliders,
  Info, Sparkles, Check, Trash2, ShieldCheck, Cpu
} from 'lucide-react';
import Layout from '../components/Layout';
import { getUser, setUser } from '../utils/storage';
import { checkBiometricAvailability, performBiometricAuth } from '../utils/biometric';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setCurrentUser] = useState(() => getUser() || {
    id: 'user_demo_001',
    name: 'Alex Johnson',
    email: 'alex@biopay.demo',
    phone: '+91 98765 43210',
    biometricEnabled: false
  });

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  });

  const [bioStatus, setBioStatus] = useState({ checking: true, available: false, reason: '' });
  const [savedMessage, setSavedMessage] = useState('');
  const [bioMessage, setBioMessage] = useState({ type: '', text: '' });
  const [passkeys, setPasskeys] = useState(() => {
    return JSON.parse(localStorage.getItem('biopay_passkeys') || '[]');
  });

  const [securitySettings, setSecuritySettings] = useState(() => {
    return JSON.parse(localStorage.getItem('biopay_security_prefs') || JSON.stringify({
      alwaysRequireBiometrics: true,
      riskThreshold: 50000,
      realtimeAlerts: true,
      demoFallbackEnabled: true
    }));
  });

  useEffect(() => {
    checkBiometricAvailability().then(res => {
      setBioStatus({ checking: false, available: res.available, reason: res.reason });
    });
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: form.name.trim() || user.name,
      phone: form.phone.trim() || user.phone,
    };
    setUser(updated);
    setCurrentUser(updated);
    setSavedMessage('Profile information saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleRegisterPasskey = async () => {
    setBioMessage({ type: 'loading', text: 'Initiating device platform passkey registration...' });

    if (!bioStatus.available) {
      // Simulate passkey creation for demo
      setTimeout(() => {
        const demoPasskey = {
          id: 'cred_demo_' + Date.now().toString(36),
          name: 'Device Authenticator (Simulated)',
          created: new Date().toISOString(),
          type: 'Platform Biometric'
        };
        const updated = [...passkeys, demoPasskey];
        setPasskeys(updated);
        localStorage.setItem('biopay_passkeys', JSON.stringify(updated));

        const updatedUser = { ...user, biometricEnabled: true };
        setUser(updatedUser);
        setCurrentUser(updatedUser);

        setBioMessage({
          type: 'success',
          text: 'Demo Biometric Passkey registered successfully! You can now authenticate simulated payments.'
        });
        setTimeout(() => setBioMessage({ type: '', text: '' }), 4000);
      }, 1000);
      return;
    }

    try {
      const res = await performBiometricAuth(user.id, user.name);
      if (res.success) {
        const newPasskey = {
          id: res.credentialId || 'cred_' + Date.now().toString(36),
          name: 'Hardware Platform Key (WebAuthn)',
          created: new Date().toISOString(),
          type: 'Hardware FIDO2'
        };
        const updated = [...passkeys, newPasskey];
        setPasskeys(updated);
        localStorage.setItem('biopay_passkeys', JSON.stringify(updated));

        const updatedUser = { ...user, biometricEnabled: true };
        setUser(updatedUser);
        setCurrentUser(updatedUser);

        setBioMessage({ type: 'success', text: 'Hardware Passkey successfully registered and bound to your device!' });
      } else {
        setBioMessage({ type: 'error', text: res.error || 'Biometric registration was declined. You can still use the demo simulation.' });
      }
    } catch (err) {
      setBioMessage({ type: 'error', text: 'Registration error. Using demo simulation instead.' });
    }
    setTimeout(() => setBioMessage({ type: '', text: '' }), 4000);
  };

  const handleRemovePasskey = (id) => {
    const updated = passkeys.filter(p => p.id !== id);
    setPasskeys(updated);
    localStorage.setItem('biopay_passkeys', JSON.stringify(updated));
    if (updated.length === 0) {
      const updatedUser = { ...user, biometricEnabled: false };
      setUser(updatedUser);
      setCurrentUser(updatedUser);
    }
  };

  const handleTogglePref = (key) => {
    const updated = { ...securitySettings, [key]: !securitySettings[key] };
    setSecuritySettings(updated);
    localStorage.setItem('biopay_security_prefs', JSON.stringify(updated));
  };

  const handleThresholdChange = (e) => {
    const val = Number(e.target.value) || 0;
    const updated = { ...securitySettings, riskThreshold: val };
    setSecuritySettings(updated);
    localStorage.setItem('biopay_security_prefs', JSON.stringify(updated));
  };

  return (
    <Layout title="Profile & Security Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header card */}
        <div className="glass-card p-6 border-gradient flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/20">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge-low flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Account Active
                </span>
                {user.biometricEnabled || passkeys.length > 0 ? (
                  <span className="badge-success flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" /> Biometrics Enabled
                  </span>
                ) : (
                  <span className="badge-pending flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" /> Passkey Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-right w-full sm:w-auto">
            <div className="text-[11px] text-white/40">User ID</div>
            <div className="font-mono text-xs text-cyan-400 font-semibold">{user.id || 'user_demo_001'}</div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Details Form */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold text-base">Personal Information</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="input-field pl-10 text-sm opacity-60 cursor-not-allowed"
                    title="Email cannot be changed in demo mode"
                  />
                </div>
                <p className="text-[11px] text-white/30 mt-1">Demo login identifier</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-field pl-10 text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {savedMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  {savedMessage}
                </div>
              )}

              <button type="submit" className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
                Save Changes
              </button>
            </form>
          </div>

          {/* Biometric Passkey Management */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold text-base">Biometric Passkeys</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50">
                  FIDO2 / WebAuthn
                </span>
              </div>

              {/* Hardware capability detector */}
              <div className={`p-3 rounded-xl border text-xs mb-4 ${
                bioStatus.available
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              }`}>
                <div className="flex items-start gap-2">
                  <Cpu className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {bioStatus.available ? 'Platform Authenticator Available' : 'Demo Fallback Mode Active'}
                    </div>
                    <div className="text-white/60 text-[11px] mt-0.5">
                      {bioStatus.reason || 'Touch ID, Face ID, or Windows Hello is ready on this device.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered passkeys list */}
              <div className="space-y-2 mb-4">
                <div className="text-xs text-white/50 font-medium">Registered Device Credentials</div>
                {passkeys.length === 0 ? (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center text-xs text-white/40">
                    No biometric passkey registered yet. Add one below to authorize transactions seamlessly.
                  </div>
                ) : (
                  passkeys.map(key => (
                    <div
                      key={key.id}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <div className="truncate">
                          <div className="text-white font-medium truncate">{key.name}</div>
                          <div className="text-white/30 text-[10px]">
                            {key.created ? format(new Date(key.created), 'dd MMM yyyy, HH:mm') : 'Active'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePasskey(key.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                        title="Delete Passkey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {bioMessage.text && (
                <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${
                  bioMessage.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
                  bioMessage.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                  'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                }`}>
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{bioMessage.text}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleRegisterPasskey}
              className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2 border-purple-500/30 hover:border-purple-500/60 text-purple-300"
            >
              <Fingerprint className="w-4 h-4" /> Register New Biometric Passkey
            </button>
          </div>
        </div>

        {/* Security Preferences & Risk Engine Parameters */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold text-base">Transaction & AI Risk Controls</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div>
                <div className="text-white text-sm font-medium">Require Biometrics on Every Payment</div>
                <div className="text-white/40 text-xs">Enforce device fingerprint/face authentication before payment release</div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePref('alwaysRequireBiometrics')}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  securitySettings.alwaysRequireBiometrics ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    securitySettings.alwaysRequireBiometrics ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div>
                <div className="text-white text-sm font-medium">Real-Time Anomaly & Risk Alerts</div>
                <div className="text-white/40 text-xs">AI scans for high amounts, unverified entities, and off-hour payments</div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePref('realtimeAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  securitySettings.realtimeAlerts ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    securitySettings.realtimeAlerts ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-white text-sm font-medium">High-Risk Amount Threshold</div>
                  <div className="text-white/40 text-xs">Transactions above this require secondary 4-digit PIN confirmation</div>
                </div>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  ₹{Number(securitySettings.riskThreshold || 50000).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="5000"
                value={securitySettings.riskThreshold || 50000}
                onChange={handleThresholdChange}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>₹10,000 (Strict)</span>
                <span>₹50,000 (Default)</span>
                <span>₹1,00,000 (Relaxed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zero-Biometric Storage Explanation */}
        <div className="glass-card p-6 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 to-blue-950/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                Zero Biometric Storage Guarantee
                <span className="badge-low text-[10px]">Privacy First</span>
              </h4>
              <p className="text-white/60 text-xs leading-relaxed">
                BioPay Nexus <strong>never collects, transmits, or stores your fingerprints or facial images</strong>. 
                Using the W3C WebAuthn / FIDO2 standard, biometric processing occurs strictly within your device's 
                isolated hardware enclave (Apple Secure Enclave or Windows Hello TPM). The server only receives an 
                asymmetric cryptographic signature confirming verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
