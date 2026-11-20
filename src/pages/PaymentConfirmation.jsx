import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Info,
  ArrowRight, Edit3, IndianRupee, User, Hash, FileText,
  Clock, AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { getPendingPayment, getUser, addTransaction, generateTxnId, clearPendingPayment } from '../utils/storage';
import { analyzeRisk } from '../utils/riskAnalysis';

const RiskMeter = ({ score }) => {
  const getColor = () => {
    if (score < 30) return { bar: 'from-green-500 to-green-400', text: 'text-green-400', label: 'Low Risk' };
    if (score < 60) return { bar: 'from-yellow-500 to-yellow-400', text: 'text-yellow-400', label: 'Medium Risk' };
    return { bar: 'from-red-500 to-red-400', text: 'text-red-400', label: 'High Risk' };
  };
  const { bar, text, label } = getColor();
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/60 text-sm">Risk Score</span>
        <span className={`font-bold text-sm ${text}`}>{score}/100 — {label}</span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${bar} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default function PaymentConfirmation() {
  const navigate = useNavigate();
  const user = getUser();
  const [payment, setPayment] = useState(null);
  const [risk, setRisk] = useState(null);
  const [editAmount, setEditAmount] = useState(false);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [additionalPin, setAdditionalPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const p = getPendingPayment();
    if (!p) { navigate('/qr-scanner'); return; }
    setPayment(p);
    setAmount(p.amount || 0);
    const r = analyzeRisk(p.amount || 0, p.recipient, p.upiId);
    setRisk(r);
  }, []);

  const handleProceed = async () => {
    if (!payment) return;

    if (risk?.requiresAdditionalAuth) {
      if (!additionalPin || additionalPin.length < 4) {
        setPinError('Please enter a 4-digit confirmation PIN for high-risk transactions.');
        return;
      }
      if (additionalPin !== '1234') {
        setPinError('Incorrect PIN. Use 1234 for this demo.');
        return;
      }
    }

    setLoading(true);
    navigate('/biometric-verification', { state: { amount, recipient: payment.recipient, upiId: payment.upiId } });
  };

  if (!payment) return null;

  return (
    <Layout title="Payment Confirmation">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Summary */}
        <div className="glass-card p-6 border-gradient">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-semibold">Payment Summary</h2>
            <span className="ml-auto text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {payment.source === 'qr' ? 'QR Payment' : 'Invoice Payment'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Amount */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white/50 text-xs mb-1">Payment Amount</div>
                {editAmount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                      onBlur={() => { setEditAmount(false); setRisk(analyzeRisk(amount, payment.recipient, payment.upiId)); }}
                      className="bg-transparent text-2xl font-black text-white w-40 outline-none border-b border-cyan-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="text-3xl font-black text-white">₹{amount.toLocaleString('en-IN')}</div>
                )}
              </div>
              <button onClick={() => setEditAmount(!editAmount)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User, label: 'Recipient', value: payment.recipient },
                { icon: Hash, label: 'UPI ID', value: payment.upiId || 'N/A' },
                { icon: FileText, label: 'Reference', value: payment.ref || 'N/A' },
                { icon: Clock, label: 'Date', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-white/40 text-xs">{label}</span>
                  </div>
                  <div className="text-white text-sm font-medium break-all">{value}</div>
                </div>
              ))}
            </div>

            {payment.note && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-white/40 text-xs mb-1">Note</div>
                <div className="text-white text-sm">{payment.note}</div>
              </div>
            )}
          </div>
        </div>

        {/* Risk analysis */}
        {risk && (
          <div className={`glass-card p-6 border ${risk.level === 'high' ? 'border-red-500/30' : risk.level === 'medium' ? 'border-yellow-500/20' : 'border-green-500/20'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Shield className={`w-5 h-5 ${risk.level === 'high' ? 'text-red-400' : risk.level === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
              <h3 className="text-white font-semibold">AI Risk Analysis</h3>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold border ${
                risk.level === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                risk.level === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                'bg-green-500/15 text-green-400 border-green-500/30'
              }`}>
                {risk.level.toUpperCase()} RISK
              </span>
            </div>

            <RiskMeter score={risk.score} />

            {risk.risks.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-white/50 text-xs mb-2">Risk Factors:</div>
                {risk.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70">{r}</span>
                  </div>
                ))}
              </div>
            )}

            {risk.level === 'low' && (
              <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Transaction appears safe. No suspicious patterns detected.
              </div>
            )}

            {/* Additional auth for high risk */}
            {risk.requiresAdditionalAuth && (
              <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">High-Risk Transaction — Additional Verification Required</span>
                </div>
                <div className="text-white/60 text-xs mb-3">Enter your 4-digit confirmation PIN to proceed (Demo PIN: 1234)</div>
                <input
                  type="password"
                  maxLength={4}
                  value={additionalPin}
                  onChange={e => { setAdditionalPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  className="input-field text-center text-2xl font-mono tracking-widest w-40"
                  placeholder="••••"
                />
                {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
              </div>
            )}
          </div>
        )}

        {/* Demo notice */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-2">
          <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-400/80 text-xs">
            <strong>Simulated Payment:</strong> No real UPI PIN, banking password, or card details are collected. 
            This is a demonstration only. The next step uses device biometrics for auth simulation.
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={() => { clearPendingPayment(); navigate('/dashboard'); }} className="btn-secondary flex items-center gap-2">
            Cancel
          </button>
          <button onClick={handleProceed} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Processing...</>
            ) : (
              <>Proceed to Biometric Auth <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
