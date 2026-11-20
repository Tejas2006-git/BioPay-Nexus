import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Shield, Fingerprint, QrCode, FileText, TrendingUp,
  ArrowRight, ChevronRight, Star, CheckCircle, Lock,
  Cpu, Globe, Users, Award
} from 'lucide-react';
import { getUser } from '../utils/storage';

const features = [
  { icon: QrCode, title: 'Smart QR Scanner', desc: 'Scan or upload QR codes to instantly extract payment details with AI precision.', color: 'cyan' },
  { icon: FileText, title: 'AI Invoice OCR', desc: 'Upload fee invoices and let our AI extract all payment details automatically.', color: 'blue' },
  { icon: Fingerprint, title: 'Biometric Security', desc: 'WebAuthn-powered fingerprint/face authentication. Your biometrics never leave your device.', color: 'purple' },
  { icon: Shield, title: 'Risk Detection', desc: 'Real-time AI analysis flags suspicious transactions before you confirm.', color: 'green' },
  { icon: TrendingUp, title: 'Smart Dashboard', desc: 'Beautiful analytics and transaction insights at a glance.', color: 'yellow' },
  { icon: Zap, title: 'Instant Receipts', desc: 'Download digital receipts instantly after every successful payment.', color: 'orange' },
];

const stats = [
  { label: 'Transactions Secured', value: '2.4M+', icon: Shield },
  { label: 'Institutions Supported', value: '500+', icon: Globe },
  { label: 'Active Users', value: '180K+', icon: Users },
  { label: 'Uptime Guarantee', value: '99.9%', icon: Award },
];

const colorMap = {
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
  green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 text-yellow-400',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="min-h-screen bg-navy-950 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">BioPay <span className="text-gradient">Nexus</span></span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2 px-5">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-mesh overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">AI-Powered Fintech Platform</span>
            <span className="bg-cyan-400 text-navy-950 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
            Secure Payments<br />
            <span className="text-gradient">Powered by AI</span><br />
            &amp; Biometrics
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            BioPay Nexus combines QR scanning, AI invoice processing, biometric authentication, 
            and real-time risk analysis to make fee payments smarter and safer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base w-full sm:w-auto justify-center">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base w-full sm:w-auto justify-center">
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Demo badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">Hackathon Demo — Simulated payments only. No real financial data collected.</span>
          </div>
        </div>

        {/* Hero mockup */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="glass-card p-4 rounded-3xl border-gradient">
            <div className="bg-navy-900 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Paid', value: '₹1,41,200', trend: '+12%', color: 'text-cyan-400' },
                { label: 'Transactions', value: '6', trend: '+3', color: 'text-blue-400' },
                { label: 'Risk Score', value: 'Low', trend: 'Safe', color: 'text-green-400' },
                { label: 'Biometric', value: 'Active', trend: 'Secured', color: 'text-purple-400' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-white/50 text-xs mb-1">{s.label}</div>
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-green-400 text-xs mt-1">{s.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-white/50 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Everything You Need for <span className="text-gradient">Smart Payments</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              A complete ecosystem for secure, AI-verified fee and financial transactions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className={`glass-card-hover p-6 bg-gradient-to-br ${colorMap[color].split(' ').slice(0,2).join(' ')}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color].split(' ').slice(0,2).join(' ')} border ${colorMap[color].split(' ')[2]} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colorMap[color].split(' ')[3]}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">How It Works</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Scan or Upload', desc: 'Scan a QR code with your camera or upload a fee invoice PDF/image.' },
              { step: '02', title: 'AI Extracts Details', desc: 'Our AI reads the QR data or performs OCR to extract recipient, amount, and invoice info.' },
              { step: '03', title: 'Risk Analysis', desc: 'Real-time risk scoring evaluates the transaction for suspicious patterns.' },
              { step: '04', title: 'Biometric Confirm', desc: 'Authenticate with your fingerprint or face ID via WebAuthn — no data ever leaves your device.' },
              { step: '05', title: 'Payment & Receipt', desc: 'Transaction is processed and a digital receipt is generated for download.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start glass-card p-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-mono font-bold text-sm">{step}</span>
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">{title}</div>
                  <div className="text-white/50 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-10 border-gradient relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
            <div className="relative">
              <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-white mb-4">Ready to Experience the Future of Payments?</h2>
              <p className="text-white/60 mb-8">Join the demo and explore all features of BioPay Nexus.</p>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base">
                Create Demo Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-white/60 text-sm">BioPay Nexus — AI-Powered Biometric Financial Platform</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400/70 text-xs">
            <Lock className="w-3 h-3" />
            Demo only. No real transactions processed.
          </div>
        </div>
      </footer>
    </div>
  );
}
