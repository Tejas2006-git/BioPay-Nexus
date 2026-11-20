import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, Shield, Download, Printer,
  Share2, ArrowLeft, Zap, Copy, Check, QrCode, FileText,
  Lock, ExternalLink, AlertTriangle, Fingerprint
} from 'lucide-react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { getTransactions } from '../utils/storage';

export default function DigitalReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    const list = getTransactions();
    const found = list.find(t => t.id === id);
    if (found) {
      setTransaction(found);
    } else {
      // If direct access with unknown id, check for first transaction or demo fallback
      if (list.length > 0) {
        setTransaction(list[0]);
      }
    }
  }, [id]);

  const handleCopyId = () => {
    if (!transaction) return;
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!transaction) return;
    setDownloading(true);

    const receiptContent = `
============================================================
              BIOPAY NEXUS - DIGITAL PAYMENT RECEIPT        
============================================================
* SIMULATED FINANCIAL TRANSACTION DEMO (NOT A REAL BANK TXN) *

Transaction ID   : ${transaction.id}
Date & Time      : ${transaction.date ? new Date(transaction.date).toLocaleString('en-IN') : 'N/A'}
Status           : ${transaction.status?.toUpperCase() || 'SUCCESS'}
Payment Type     : ${transaction.type || 'Simulated Payment'}

----------------------- DETAILS ----------------------------
Recipient        : ${transaction.recipient || 'N/A'}
Beneficiary UPI  : ${transaction.upiId || 'N/A'}
Invoice Number   : ${transaction.invoiceNo || 'N/A'}
Amount Paid      : INR ${Number(transaction.amount || 0).toLocaleString('en-IN')}

------------------- SECURITY & VERIFICATION ---------------
Authentication   : WebAuthn / FIDO2 Device Biometric Verified
Risk Level       : ${(transaction.riskLevel || 'low').toUpperCase()}
Biometric Vault  : Client-Side Only (Zero biometric data stored)
Simulation Mode  : Hackathon Demonstration Protocol
============================================================
Thank you for using BioPay Nexus Smart Fee Payment Platform!
============================================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BioPay_Receipt_${transaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloading(false), 800);
  };

  if (!transaction) {
    return (
      <Layout title="Digital Receipt">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/40">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Receipt Not Found</h2>
          <p className="text-white/50 text-sm mb-6">
            We couldn't locate a transaction with ID <span className="font-mono text-cyan-400">{id}</span>.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/transaction-history')} className="btn-secondary text-sm py-2.5 px-4">
              View All Transactions
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2.5 px-4">
              Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isSuccess = transaction.status === 'success';
  const isPending = transaction.status === 'pending';

  return (
    <Layout title="Digital Receipt">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/transaction-history')}
            className="text-xs sm:text-sm text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to History
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Downloading...' : 'Download Receipt'}
            </button>
          </div>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-yellow-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Simulated Transaction Voucher:</strong> Demo purposes only. No actual banking or UPI settlement took place.
          </span>
        </div>

        {/* Printable Receipt Card */}
        <div
          ref={receiptRef}
          className="glass-card overflow-hidden border-gradient p-6 sm:p-8 relative bg-gradient-to-b from-navy-900/90 to-navy-950/90 shadow-2xl"
        >
          {/* Subtle Watermark background */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <Fingerprint className="w-64 h-64 text-cyan-400" />
          </div>

          {/* Receipt Header */}
          <div className="border-b border-white/10 pb-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    BioPay <span className="text-gradient">Nexus</span>
                  </h1>
                  <p className="text-xs text-cyan-400/80 font-mono tracking-wide">
                    SECURE SMART FEE RECEIPT
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="text-right">
                {isSuccess ? (
                  <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    PAID (SIMULATED)
                  </div>
                ) : isPending ? (
                  <div className="inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    PROCESSING
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    FAILED
                  </div>
                )}
                <div className="text-[11px] text-white/30 mt-1 font-mono">
                  {transaction.date ? format(new Date(transaction.date), 'dd MMM yyyy, HH:mm:ss') : 'N/A'}
                </div>
              </div>
            </div>

            {/* Big Amount */}
            <div className="mt-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Total Amount Paid</div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-cyan-400/80 mt-1 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>WebAuthn Biometric Authenticated</span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40">Transaction ID</span>
              <div className="flex items-center gap-1.5 font-mono text-white font-medium">
                <span>{transaction.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40">Beneficiary / Institution</span>
              <span className="text-white font-semibold text-right">{transaction.recipient || 'N/A'}</span>
            </div>

            {transaction.upiId && (
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Recipient UPI ID</span>
                <span className="font-mono text-cyan-400 text-right">{transaction.upiId}</span>
              </div>
            )}

            {transaction.invoiceNo && transaction.invoiceNo !== 'N/A' && (
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Invoice / Reference No.</span>
                <span className="font-mono text-white text-right">{transaction.invoiceNo}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40">Category / Type</span>
              <span className="text-white text-right">{transaction.type || 'Standard Transfer'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40">AI Risk Assessment</span>
              <span className="capitalize font-medium text-right flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  transaction.riskLevel === 'high' ? 'bg-red-400' :
                  transaction.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                {transaction.riskLevel || 'Low'} Risk Score
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/40">Auth Method</span>
              <span className="text-white/90 text-right flex items-center gap-1.5 font-medium">
                <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                FIDO2 WebAuthn Passkey (Simulated)
              </span>
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-1.5">
                <QrCode className="w-full h-full text-cyan-400" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">Cryptographic Proof</div>
                <div className="text-[10px] text-white/40 font-mono mt-0.5">SHA256: {transaction.id.slice(-6)}...VERIFIED</div>
                <div className="text-[10px] text-green-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" /> Zero Biometric Storage Confirmed
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-xs font-bold text-white">BioPay Nexus Engine</div>
              <div className="text-[11px] text-white/40">Simulated FinTech Gateway v1.0</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/qr-scanner')}
            className="btn-primary w-full sm:w-auto text-sm py-2.5 px-6 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Scan Another QR
          </button>
          <button
            onClick={() => navigate('/invoice-scanner')}
            className="btn-secondary w-full sm:w-auto text-sm py-2.5 px-6 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Upload New Invoice
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto text-sm py-2.5 px-6 text-white/50 hover:text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
}
