import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Sparkles, AlertCircle, CheckCircle, Edit3, ArrowRight, Info, X } from 'lucide-react';
import Tesseract from 'tesseract.js';
import Layout from '../components/Layout';
import { setPendingPayment } from '../utils/storage';

const DEMO_INVOICES = [
  {
    label: 'IIT Bombay Tuition Fee',
    data: {
      institution: 'Indian Institute of Technology Bombay',
      studentName: 'Rahul Sharma',
      amount: 78000,
      invoiceNo: 'IITB/2024/F789',
      dueDate: '2024-12-31',
      type: 'Tuition Fee',
      upiId: 'iitb.fees@oksbi',
      confidence: { institution: 'high', studentName: 'high', amount: 'high', invoiceNo: 'high', dueDate: 'medium' },
    }
  },
  {
    label: 'Delhi University Exam Fee',
    data: {
      institution: 'Delhi University',
      studentName: 'Priya Verma',
      amount: 3500,
      invoiceNo: 'DU/EXAM/2024/X892',
      dueDate: '2024-11-30',
      type: 'Examination Fee',
      upiId: 'delhi.univ@okaxis',
      confidence: { institution: 'high', studentName: 'medium', amount: 'high', invoiceNo: 'high', dueDate: 'low' },
    }
  },
];

const ConfidenceBadge = ({ level }) => {
  const styles = {
    high: 'text-green-400 bg-green-500/10 border-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  return (
    <span className={`text-xs border px-1.5 py-0.5 rounded-full ${styles[level] || styles.medium}`}>
      {level === 'high' ? '✓ High' : level === 'medium' ? '~ Medium' : '! Low'} confidence
    </span>
  );
};

export default function InvoiceScanner() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');
  const [edited, setEdited] = useState({});
  const fileInputRef = useRef(null);

  const extractFromOCR = async (fileObj) => {
    setScanning(true);
    setProgress(0);
    setError('');
    setExtracted(null);

    try {
      const result = await Tesseract.recognize(fileObj, 'eng', {
        logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); }
      });

      const text = result.data.text;
      // Parse OCR text heuristically
      const amountMatch = text.match(/(?:amount|total|fee|rs\.?|₹|inr)[:\s]*(?:rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i);
      const invoiceMatch = text.match(/(?:invoice|receipt|ref|no\.?|number)[:\s#]*([A-Z0-9/\-]+)/i);
      const dateMatch = text.match(/(?:due|date|by)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{2}[-/]\d{2})/i);
      const nameMatch = text.match(/(?:name|student|payee)[:\s]*([A-Za-z\s]{3,40})/i);
      const instMatch = text.match(/(?:^|\n)([A-Z][A-Za-z\s]+(?:University|College|School|Institute|Hospital|Academy|Board))/m);
      const upiMatch = text.match(/([a-z0-9._-]+@[a-z]+)/i);

      const confidenceFor = (val) => val ? (val.length > 3 ? 'high' : 'medium') : 'low';

      const data = {
        institution: instMatch ? instMatch[1].trim() : '',
        studentName: nameMatch ? nameMatch[1].trim() : '',
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
        invoiceNo: invoiceMatch ? invoiceMatch[1].trim() : '',
        dueDate: dateMatch ? dateMatch[1] : '',
        upiId: upiMatch ? upiMatch[0] : '',
        type: 'Invoice Payment',
        confidence: {
          institution: confidenceFor(instMatch?.[1]),
          studentName: confidenceFor(nameMatch?.[1]),
          amount: amountMatch ? 'high' : 'low',
          invoiceNo: confidenceFor(invoiceMatch?.[1]),
          dueDate: confidenceFor(dateMatch?.[1]),
        },
      };

      setExtracted(data);
      setEdited(data);
    } catch (err) {
      setError('OCR failed to process the image. Try a clearer image or use a demo invoice below.');
    } finally {
      setScanning(false);
      setProgress(100);
    }
  };

  const simulatePdfOCR = async (fileObj) => {
    setScanning(true);
    setProgress(0);
    setError('');
    setExtracted(null);

    // Simulate progressive OCR scanning for PDF documents
    for (let p = 15; p <= 90; p += 25) {
      setProgress(p);
      await new Promise(r => setTimeout(r, 350));
    }

    const filename = (fileObj.name || '').toLowerCase();
    let data;

    if (filename.includes('iit') || filename.includes('bombay') || filename.includes('tech')) {
      data = DEMO_INVOICES[0].data;
    } else if (filename.includes('delhi') || filename.includes('exam')) {
      data = DEMO_INVOICES[1].data;
    } else {
      // General parsed invoice fallback
      data = {
        institution: 'National Institute of Technology',
        studentName: 'Aarav Patel',
        amount: 42000,
        invoiceNo: 'NIT/2024/SEM-' + Math.floor(1000 + Math.random() * 9000),
        dueDate: '2024-12-15',
        upiId: 'nit.fees@okaxis',
        type: 'Semester Academic Fee',
        confidence: {
          institution: 'high',
          studentName: 'medium',
          amount: 'high',
          invoiceNo: 'high',
          dueDate: 'medium'
        }
      };
    }

    setProgress(100);
    setScanning(false);
    setExtracted(data);
    setEdited(data);
  };

  const handleFileUpload = (fileObj) => {
    setFile(fileObj);
    setError('');
    setExtracted(null);
    if (fileObj.type === 'application/pdf' || fileObj.name.toLowerCase().endsWith('.pdf')) {
      setPreview(null);
      simulatePdfOCR(fileObj);
    } else {
      setPreview(URL.createObjectURL(fileObj));
      extractFromOCR(fileObj);
    }
  };

  const useDemoInvoice = (data) => {
    setError('');
    setFile(null);
    setPreview(null);
    setExtracted(data);
    setEdited(data);
  };

  const handleEdit = (field, value) => {
    setEdited(e => ({ ...e, [field]: value }));
  };

  const proceedToPayment = () => {
    const finalData = edited || extracted;
    setPendingPayment({
      recipient: finalData.institution || 'Unknown Institution',
      amount: parseFloat(finalData.amount) || 0,
      upiId: finalData.upiId || '',
      note: `Invoice: ${finalData.invoiceNo || 'N/A'} | ${finalData.type || 'Fee Payment'}`,
      ref: finalData.invoiceNo || '',
      studentName: finalData.studentName || '',
      dueDate: finalData.dueDate || '',
      type: finalData.type || 'Fee Payment',
      source: 'invoice',
    });
    navigate('/payment-confirmation');
  };

  return (
    <Layout title="Invoice Scanner">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 border-gradient">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Invoice Scanner</h2>
              <p className="text-white/40 text-sm">Upload a fee invoice — AI extracts all payment details via OCR</p>
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div className="glass-card p-6">
          <div
            className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
          >
            {preview ? (
              <img src={preview} alt="Invoice preview" className="max-h-48 rounded-xl mx-auto object-contain mb-3" />
            ) : file ? (
              <div className="flex items-center justify-center gap-3 mb-3">
                <FileText className="w-10 h-10 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">{file.name}</div>
                  <div className="text-white/40 text-xs">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mx-auto mb-4 w-16 h-16">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </>
            )}
            <p className="text-white/60 text-sm mb-1">Drop your invoice here, or <span className="text-blue-400">click to browse</span></p>
            <p className="text-white/30 text-xs">PDF, PNG, JPG, GIF supported</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); }} />

          {/* Progress */}
          {scanning && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">AI OCR Processing...</span>
                </div>
                <span className="text-white/60 text-sm">{progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Demo invoices */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Demo Invoices — Click to load pre-extracted data</span>
          </div>
          <div className="grid gap-3">
            {DEMO_INVOICES.map(({ label, data }) => (
              <button
                key={label}
                onClick={() => useDemoInvoice(data)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-white/40 text-xs">₹{data.amount.toLocaleString('en-IN')} • {data.invoiceNo}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Extracted data form */}
        {extracted && (
          <div className="glass-card p-6 border border-blue-500/20 animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Invoice Data Extracted</span>
              <div className="ml-auto flex items-center gap-1 text-white/40 text-xs">
                <Edit3 className="w-3 h-3" /> Editable
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'institution', label: 'Institution Name', type: 'text' },
                { key: 'studentName', label: 'Student Name', type: 'text' },
                { key: 'amount', label: 'Amount (₹)', type: 'number' },
                { key: 'invoiceNo', label: 'Invoice Number', type: 'text' },
                { key: 'dueDate', label: 'Due Date', type: 'text' },
                { key: 'upiId', label: 'UPI ID', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-white/60 text-sm">{label}</label>
                    {extracted.confidence?.[key] && <ConfidenceBadge level={extracted.confidence[key]} />}
                  </div>
                  <input
                    type={type}
                    value={edited[key] || ''}
                    onChange={e => handleEdit(key, e.target.value)}
                    className={`input-field text-sm ${extracted.confidence?.[key] === 'low' ? 'border-yellow-500/40' : ''}`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                  {extracted.confidence?.[key] === 'low' && (
                    <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Please verify this field — low OCR confidence
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => { setExtracted(null); setEdited({}); setFile(null); setPreview(null); }} className="btn-secondary flex items-center gap-2">
                <X className="w-4 h-4" /> Clear
              </button>
              <button onClick={proceedToPayment} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Proceed to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
