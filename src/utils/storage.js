import { format } from 'date-fns';

export const initDemoData = () => {
  if (!localStorage.getItem('biopay_initialized')) {
    const demoUser = {
      id: 'user_demo_001',
      name: 'Alex Johnson',
      email: 'alex@biopay.demo',
      phone: '+91 98765 43210',
      avatar: null,
      biometricEnabled: false,
      createdAt: new Date().toISOString(),
    };
    // Don't auto-login; just seed transactions
    const demoTransactions = [
      { id: 'TXN001', recipient: 'Delhi University', amount: 45000, type: 'Fee Payment', status: 'success', riskLevel: 'low', date: new Date(Date.now() - 86400000 * 2).toISOString(), upiId: 'delhi.univ@okaxis', invoiceNo: 'DU/2024/001' },
      { id: 'TXN002', recipient: 'City Hospital', amount: 12500, type: 'Medical Fee', status: 'success', riskLevel: 'low', date: new Date(Date.now() - 86400000 * 5).toISOString(), upiId: 'cityhospital@okicici', invoiceNo: 'CH/2024/045' },
      { id: 'TXN003', recipient: 'Unknown Vendor XYZ', amount: 95000, type: 'Transfer', status: 'failed', riskLevel: 'high', date: new Date(Date.now() - 86400000 * 7).toISOString(), upiId: 'unknownvendor@okhdfc', invoiceNo: 'N/A' },
      { id: 'TXN004', recipient: 'IIT Bombay', amount: 78000, type: 'Fee Payment', status: 'success', riskLevel: 'low', date: new Date(Date.now() - 86400000 * 10).toISOString(), upiId: 'iitb.fees@oksbi', invoiceNo: 'IITB/2024/F789' },
      { id: 'TXN005', recipient: 'Exam Board CBSE', amount: 2500, type: 'Exam Fee', status: 'pending', riskLevel: 'medium', date: new Date(Date.now() - 86400000).toISOString(), upiId: 'cbse.fees@okaxis', invoiceNo: 'CBSE/2024/X001' },
      { id: 'TXN006', recipient: 'Metro Water Board', amount: 3200, type: 'Utility', status: 'success', riskLevel: 'low', date: new Date(Date.now() - 3600000 * 3).toISOString(), upiId: 'metrowater@okicici', invoiceNo: 'MWB/NOV/2024' },
    ];
    localStorage.setItem('biopay_transactions', JSON.stringify(demoTransactions));
    localStorage.setItem('biopay_initialized', 'true');
  }
};

export const getUser = () => JSON.parse(localStorage.getItem('biopay_user') || 'null');
export const setUser = (user) => localStorage.setItem('biopay_user', JSON.stringify(user));
export const clearUser = () => localStorage.removeItem('biopay_user');

export const getTransactions = () => JSON.parse(localStorage.getItem('biopay_transactions') || '[]');
export const addTransaction = (txn) => {
  const txns = getTransactions();
  txns.unshift(txn);
  localStorage.setItem('biopay_transactions', JSON.stringify(txns));
  return txn;
};

export const generateTxnId = () => 'TXN' + Date.now().toString().slice(-8).toUpperCase();

export const getPendingPayment = () => JSON.parse(sessionStorage.getItem('biopay_pending_payment') || 'null');
export const setPendingPayment = (data) => sessionStorage.setItem('biopay_pending_payment', JSON.stringify(data));
export const clearPendingPayment = () => sessionStorage.removeItem('biopay_pending_payment');
