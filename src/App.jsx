import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import QRScanner from './pages/QRScanner';
import InvoiceScanner from './pages/InvoiceScanner';
import PaymentConfirmation from './pages/PaymentConfirmation';
import BiometricVerification from './pages/BiometricVerification';
import TransactionHistory from './pages/TransactionHistory';
import DigitalReceipt from './pages/DigitalReceipt';
import ProfileSettings from './pages/ProfileSettings';
import { initDemoData } from './utils/storage';

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('biopay_user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  useEffect(() => { initDemoData(); }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/qr-scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
        <Route path="/invoice-scanner" element={<ProtectedRoute><InvoiceScanner /></ProtectedRoute>} />
        <Route path="/payment-confirmation" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
        <Route path="/biometric-verification" element={<ProtectedRoute><BiometricVerification /></ProtectedRoute>} />
        <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
        <Route path="/receipt/:id" element={<ProtectedRoute><DigitalReceipt /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
