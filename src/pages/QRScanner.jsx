import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { QrCode, Upload, Camera, CheckCircle, AlertCircle, Info, ArrowRight, X, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import { setPendingPayment } from '../utils/storage';

const DEMO_QR_DATA = [
  { label: 'Delhi University Fee', data: 'upi://pay?pa=delhi.univ@okaxis&pn=Delhi+University&am=45000&tn=Semester+Fee+2024&tr=DU/2024/SEM1' },
  { label: 'City Hospital', data: 'upi://pay?pa=cityhospital@okicici&pn=City+Hospital&am=12500&tn=Medical+Consultation&tr=CH/2024/MED456' },
  { label: 'CBSE Exam Fee', data: 'upi://pay?pa=cbse.fees@okaxis&pn=CBSE+Board&am=2500&tn=Class+XII+Exam+Fee&tr=CBSE/2024/X001' },
];

function parseUPIString(data) {
  try {
    if (data.startsWith('upi://')) {
      const url = new URL(data.replace('upi://', 'http://'));
      return {
        upiId: url.searchParams.get('pa') || '',
        recipientName: (url.searchParams.get('pn') || '').replace(/\+/g, ' '),
        amount: parseFloat(url.searchParams.get('am') || '0'),
        note: (url.searchParams.get('tn') || '').replace(/\+/g, ' '),
        ref: url.searchParams.get('tr') || '',
        type: 'UPI Payment',
      };
    }
    // Try JSON
    return { ...JSON.parse(data), type: 'QR Data' };
  } catch {
    return { raw: data, recipientName: 'Unknown', amount: 0, upiId: '', note: data, type: 'Raw QR' };
  }
}

export default function QRScanner() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('upload'); // 'camera' | 'upload'
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const handleQRSuccess = (decodedText) => {
    setScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    const parsed = parseUPIString(decodedText);
    setResult(parsed);
  };

  const startCamera = () => {
    setError('');
    setResult(null);
    setScanning(true);
  };

  useEffect(() => {
    if (scanning && mode === 'camera') {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
      }, false);

      scanner.render(
        (decoded) => { handleQRSuccess(decoded); },
        (err) => { /* ignore scan errors */ }
      );
      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [scanning, mode]);

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setResult(null);
    setProcessing(true);

    const url = URL.createObjectURL(file);
    setUploadedImage(url);

    try {
      const html5Qr = new Html5Qrcode('qr-file-reader');
      html5QrRef.current = html5Qr;
      const decoded = await html5Qr.scanFileV2(file, true);
      handleQRSuccess(decoded.decodedText);
    } catch (err) {
      setError('Could not detect a QR code in the image. Try a clearer image or use a demo QR below.');
    } finally {
      setProcessing(false);
      if (html5QrRef.current) {
        try { await html5QrRef.current.clear(); } catch {}
      }
    }
  };

  const useDemoQR = (data) => {
    setError('');
    setUploadedImage(null);
    const parsed = parseUPIString(data);
    setResult(parsed);
  };

  const proceedToPayment = () => {
    if (!result) return;
    setPendingPayment({
      recipient: result.recipientName || result.raw || 'Unknown',
      amount: result.amount || 0,
      upiId: result.upiId || '',
      note: result.note || '',
      ref: result.ref || '',
      type: result.type || 'QR Payment',
      source: 'qr',
    });
    navigate('/payment-confirmation');
  };

  return (
    <Layout title="QR Scanner">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 border-gradient">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Smart QR Scanner</h2>
              <p className="text-white/40 text-sm">Scan UPI QR codes via camera or image upload</p>
            </div>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {[
            { key: 'upload', icon: Upload, label: 'Upload Image' },
            { key: 'camera', icon: Camera, label: 'Live Camera' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setResult(null); setError(''); stopCamera(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === key ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Scanner area */}
        <div className="glass-card p-6">
          {mode === 'camera' ? (
            <div>
              {!scanning ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-cyan-400" />
                  </div>
                  <p className="text-white/60 mb-6">Click below to start your camera and scan a QR code</p>
                  <button onClick={startCamera} className="btn-primary flex items-center gap-2 mx-auto">
                    <Camera className="w-4 h-4" /> Start Camera
                  </button>
                </div>
              ) : (
                <div>
                  <div id="qr-reader" className="w-full" />
                  <button onClick={stopCamera} className="btn-secondary w-full mt-4 flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Stop Camera
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div
                className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload({ target: { files: [f] } }); }}
              >
                {uploadedImage ? (
                  <div className="relative inline-block">
                    <img src={uploadedImage} alt="Uploaded QR" className="max-h-48 rounded-xl mx-auto object-contain" />
                    {processing && (
                      <div className="absolute inset-0 bg-navy-950/80 rounded-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-white/30 group-hover:text-cyan-400 transition-colors mx-auto mb-3" />
                    <p className="text-white/60 text-sm mb-1">Drop a QR code image here, or <span className="text-cyan-400">click to browse</span></p>
                    <p className="text-white/30 text-xs">PNG, JPG, GIF supported</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>
          )}

          {/* Hidden div for file scanner */}
          <div id="qr-file-reader" className="hidden" />

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Demo QR buttons */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-white/70 text-sm font-medium">Demo QR Codes — Click to simulate a scan</span>
          </div>
          <div className="grid gap-3">
            {DEMO_QR_DATA.map(({ label, data }) => (
              <button
                key={label}
                onClick={() => useDemoQR(data)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-white/40 text-xs truncate max-w-xs">{parseUPIString(data).upiId}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="glass-card p-6 border border-green-500/20 animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">QR Code Decoded Successfully</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Recipient', value: result.recipientName || result.raw || 'N/A' },
                { label: 'UPI ID', value: result.upiId || 'N/A' },
                { label: 'Amount', value: result.amount ? `₹${result.amount.toLocaleString('en-IN')}` : 'Enter manually' },
                { label: 'Reference', value: result.ref || 'N/A' },
                { label: 'Note', value: result.note || 'N/A', span: true },
              ].map(({ label, value, span }) => (
                <div key={label} className={`${span ? 'col-span-2' : ''}`}>
                  <div className="text-white/40 text-xs mb-1">{label}</div>
                  <div className="text-white text-sm font-medium break-all">{value}</div>
                </div>
              ))}
            </div>
            <button onClick={proceedToPayment} className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Payment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
