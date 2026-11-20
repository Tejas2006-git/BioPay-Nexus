import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fingerprint, Scan, Shield, CheckCircle, XCircle, AlertCircle, Info, Zap, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import { checkBiometricAvailability } from '../utils/biometric';
import { getUser, getPendingPayment, addTransaction, generateTxnId, clearPendingPayment } from '../utils/storage';
import { analyzeRisk } from '../utils/riskAnalysis';

const DEMO_STEPS = [
  { text: 'Initializing secure channel...', duration: 600 },
  { text: 'Contacting authenticator...', duration: 800 },
  { text: 'Verifying biometric signature...', duration: 1000 },
  { text: 'Validating transaction payload...', duration: 700 },
  { text: 'Generating cryptographic proof...', duration: 900 },
];

export default function BiometricVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [bioAvail, setBioAvail] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | scanning | success | failed | demo_scanning
  const [step, setStep] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const [demoText, setDemoText] = useState('');
  const [error, setError] = useState('');
  const payment = getPendingPayment();

  useEffect(() => {
    checkBiometricAvailability().then(setBioAvail);
  }, []);

  const runDemoAuth = async () => {
    setStatus('demo_scanning');
    setDemoStep(0);
    for (let i = 0; i < DEMO_STEPS.length; i++) {
      setDemoText(DEMO_STEPS[i].text);
      setDemoStep(i + 1);
      await new Promise(r => setTimeout(r, DEMO_STEPS[i].duration));
    }
    completePayment(true);
  };

  const runBiometricAuth = async () => {
    setStatus('scanning');
    setError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000,
        },
      });
      completePayment(true);
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setStatus('failed');
        setError('Biometric authentication was cancelled or denied. Try the demo fallback.');
      } else {
        // Fall through to demo if no credentials registered
        await runDemoAuth();
      }
    }
  };

  const completePayment = (success) => {
    if (!payment) {
      // Standalone diagnostics mode
      setStatus(success ? 'success' : 'failed');
      return;
    }
    const risk = analyzeRisk(payment.amount, payment.recipient, payment.upiId);
    const txnId = generateTxnId();
    const txn = {
      id: txnId,
      recipient: payment.recipient,
      amount: payment.amount,
      type: payment.type || 'Payment',
      status: success ? 'success' : 'failed',
      riskLevel: risk.level,
      date: new Date().toISOString(),
      upiId: payment.upiId || '',
      invoiceNo: payment.ref || 'N/A',
      note: payment.note || '',
    };
    addTransaction(txn);
    clearPendingPayment();
    setStatus(success ? 'success' : 'failed');
    setTimeout(() => navigate(`/receipt/${txnId}`), 1500);
  };

  const StepDot = ({ active, done, num }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
      done ? 'bg-green-500 border-green-500 text-white' :
      active ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 animate-pulse' :
      'bg-white/5 border-white/15 text-white/30'
    }`}>
      {done ? '✓' : num}
    </div>
  );

  return (
    <Layout title="Biometric Verification">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 border-gradient">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Biometric Verification</h2>
              <p className="text-white/40 text-sm">Authenticate to authorize the transaction</p>
            </div>
          </div>
        </div>

        {/* Payment summary mini */}
        {payment && (
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{payment.recipient}</div>
              <div className="text-white/40 text-xs">{payment.upiId || 'UPI Payment'}</div>
            </div>
            <div className="text-cyan-400 font-black text-lg">₹{(payment.amount || 0).toLocaleString('en-IN')}</div>
          </div>
        )}

        {/* Main auth card */}
        <div className="glass-card p-8 text-center">
          {/* Status display */}
          {status === 'idle' && (
            <>
              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 rounded-full bg-purple-500/10 border-2 border-purple-500/20 flex items-center justify-center mx-auto">
                  <Fingerprint className="w-14 h-14 text-purple-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-pulse-ring" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Ready to Authenticate</h3>
              <p className="text-white/50 text-sm mb-6">
                {bioAvail?.available
                  ? 'Your device supports biometric authentication. Touch the sensor or use Face ID.'
                  : 'Biometric auth unavailable on this device. Use the demo fallback below.'}
              </p>

              {/* Biometric support info */}
              {bioAvail && (
                <div className={`text-xs px-4 py-2 rounded-xl mb-6 inline-block border ${
                  bioAvail.available
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {bioAvail.available ? '✓ Platform authenticator detected' : '⚠ ' + bioAvail.reason}
                </div>
              )}

              <div className="space-y-3">
                {bioAvail?.available && (
                  <button onClick={runBiometricAuth} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Fingerprint className="w-5 h-5" /> Authenticate with Biometrics
                  </button>
                )}
                <button onClick={runDemoAuth} className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border font-medium transition-all ${
                  bioAvail?.available
                    ? 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                    : 'btn-primary'
                }`}>
                  <Scan className="w-5 h-5" />
                  {bioAvail?.available ? 'Use Demo Fallback' : 'Simulate Biometric Auth (Demo)'}
                </button>
              </div>

              {/* Notice */}
              <div className="mt-6 flex items-start gap-2 text-left bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-400/80 text-xs">
                  <strong>Privacy Notice:</strong> BioPay Nexus uses WebAuthn/FIDO2 for authentication. 
                  Your biometric data (fingerprint/face) <strong>never</strong> leaves your device. 
                  We only receive a cryptographic proof that authentication succeeded.
                </p>
              </div>
            </>
          )}

          {status === 'scanning' && (
            <div className="py-8">
              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center mx-auto animate-pulse">
                  <Fingerprint className="w-14 h-14 text-cyan-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 animate-pulse-ring" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Touch the Sensor</h3>
              <p className="text-white/50 text-sm">Place your finger on the biometric sensor or look at the camera...</p>
            </div>
          )}

          {status === 'demo_scanning' && (
            <div className="py-4">
              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center mx-auto">
                  <Scan className="w-14 h-14 text-cyan-400 animate-spin-slow" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-pulse-ring" />
              </div>
              <h3 className="text-white text-lg font-bold mb-4">Simulating Biometric Auth</h3>

              {/* Steps */}
              <div className="text-left space-y-3 mb-4">
                {DEMO_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                    i < demoStep ? 'text-green-400' :
                    i === demoStep - 1 ? 'text-cyan-400' :
                    'text-white/30'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      i < demoStep ? 'bg-green-500/20' : i === demoStep - 1 ? 'bg-cyan-500/20 animate-pulse' : 'bg-white/5'
                    }`}>
                      {i < demoStep ? '✓' : i + 1}
                    </div>
                    {s.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 animate-fade-in">
              <div className="w-28 h-28 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-14 h-14 text-green-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Authentication Successful!</h3>
              {payment ? (
                <>
                  <p className="text-white/50 text-sm">Payment authorized. Generating digital receipt...</p>
                  <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/60 text-sm">
                    Biometric credentials verified. Your browser and authenticator are ready to authorize payments.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs py-2 px-4">
                      Dashboard
                    </button>
                    <button onClick={() => navigate('/qr-scanner')} className="btn-primary text-xs py-2 px-4">
                      Scan QR to Pay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'failed' && (
            <div className="py-8 animate-fade-in">
              <div className="w-28 h-28 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-14 h-14 text-red-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Authentication Failed</h3>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <div className="space-y-3">
                <button onClick={() => { setStatus('idle'); setError(''); }} className="btn-primary w-full">Try Again</button>
                <button onClick={runDemoAuth} className="btn-secondary w-full">Use Demo Fallback</button>
              </div>
            </div>
          )}
        </div>

        {/* WebAuthn info */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-white/70 text-sm font-medium">WebAuthn Security</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Standard', value: 'FIDO2 / WebAuthn' },
              { label: 'Biometric Storage', value: 'Device only' },
              { label: 'Data Sent', value: 'Crypto proof only' },
              { label: 'Supported', value: bioAvail?.available ? 'Yes ✓' : 'No (demo)' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">{label}</div>
                <div className="text-white font-medium mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
