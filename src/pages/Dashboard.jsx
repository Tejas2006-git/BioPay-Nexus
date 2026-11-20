import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ArrowUpRight, QrCode, FileText, Shield, AlertTriangle,
  CheckCircle, Clock, XCircle, Fingerprint, ChevronRight, Zap,
  IndianRupee, Activity, PieChart
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import Layout from '../components/Layout';
import { getUser, getTransactions, setPendingPayment } from '../utils/storage';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const StatusIcon = ({ status }) => {
  if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-400" />;
  return <XCircle className="w-4 h-4 text-red-400" />;
};

const StatusBadge = ({ status }) => {
  const cls = { success: 'badge-success', pending: 'badge-pending', failed: 'badge-failed' }[status] || 'badge-pending';
  return <span className={cls}>{status}</span>;
};

const RiskBadge = ({ level }) => {
  const cls = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' }[level] || 'badge-low';
  return <span className={cls}>{level} risk</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const transactions = getTransactions();

  // Stats
  const total = transactions.reduce((s, t) => t.status === 'success' ? s + t.amount : s, 0);
  const successful = transactions.filter(t => t.status === 'success').length;
  const pending = transactions.filter(t => t.status === 'pending').length;
  const failed = transactions.filter(t => t.status === 'failed').length;

  // Chart data - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, 'MMM d');
    const dayTxns = transactions.filter(t => format(new Date(t.date), 'MMM d') === dayStr);
    return {
      name: format(day, 'EEE'),
      amount: dayTxns.reduce((s, t) => t.status === 'success' ? s + t.amount : s, 0),
      count: dayTxns.length,
    };
  });

  // Pie chart
  const pieData = [
    { name: 'Success', value: successful },
    { name: 'Pending', value: pending },
    { name: 'Failed', value: failed },
  ].filter(d => d.value > 0);

  // Risk overview
  const riskData = [
    { name: 'Low', value: transactions.filter(t => t.riskLevel === 'low').length, color: '#10b981' },
    { name: 'Medium', value: transactions.filter(t => t.riskLevel === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: transactions.filter(t => t.riskLevel === 'high').length, color: '#ef4444' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{greeting}, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
            <p className="text-white/50 text-sm mt-1">Here's your financial overview</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/qr-scanner')} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
              <QrCode className="w-4 h-4" /> Scan QR
            </button>
            <button onClick={() => navigate('/invoice-scanner')} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
              <FileText className="w-4 h-4" /> Upload Invoice
            </button>
          </div>
        </div>

        {/* Demo notice */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-yellow-400 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>Demo Mode:</strong> All transactions are simulated. No real payments are processed.</span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Payments', value: `₹${total.toLocaleString('en-IN')}`, sub: `${successful} successful`, icon: IndianRupee, color: 'cyan', trend: '+12%' },
            { label: 'Successful', value: successful, sub: 'transactions', icon: CheckCircle, color: 'green', trend: '+3' },
            { label: 'Pending', value: pending, sub: 'in progress', icon: Clock, color: 'yellow', trend: '' },
            { label: 'Failed', value: failed, sub: 'transactions', icon: XCircle, color: 'red', trend: '' },
          ].map(({ label, value, sub, icon: Icon, color, trend }) => (
            <div key={label} className="stat-card group">
              <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent rounded-2xl`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  {trend && <span className="text-xs text-green-400 font-medium flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{trend}</span>}
                </div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-white/50 text-xs mt-0.5">{label}</div>
                <div className="text-white/30 text-xs">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Area chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold">Payment Activity</h3>
                <p className="text-white/40 text-xs">Last 7 days</p>
              </div>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `₹${(v/1000).toFixed(0)}k` : '0'} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1628', border: '1px solid #ffffff15', borderRadius: '12px', color: '#fff' }}
                  formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold">Status Overview</h3>
                <p className="text-white/40 text-xs">All time</p>
              </div>
              <PieChart className="w-5 h-5 text-cyan-400" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444'][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0a1628', border: '1px solid #ffffff15', borderRadius: '12px', color: '#fff' }} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {[{ label: 'Success', color: 'bg-green-400' }, { label: 'Pending', color: 'bg-yellow-400' }, { label: 'Failed', color: 'bg-red-400' }].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-white/50 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk + Quick actions row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Risk overview */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Risk Overview</h3>
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-3">
              {riskData.map(({ name, value, color }) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{name} Risk</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${transactions.length ? (value / transactions.length) * 100 : 0}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs">AI risk analysis active</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-5">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: QrCode, label: 'Scan QR Code', sub: 'Camera or upload', path: '/qr-scanner', color: 'cyan' },
                { icon: FileText, label: 'Upload Invoice', sub: 'PDF or image OCR', path: '/invoice-scanner', color: 'blue' },
                { icon: Fingerprint, label: 'Biometric Setup', sub: 'WebAuthn security', path: '/biometric-verification', color: 'purple' },
              ].map(({ icon: Icon, label, sub, path, color }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl bg-${color}-500/5 border border-${color}-500/15 hover:bg-${color}-500/10 hover:border-${color}-500/30 transition-all group`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-${color}-500/15 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-white/40 text-xs">{sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                </button>
              ))}
            </div>
          </div>

          {/* Biometric status */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-5">Security Status</h3>
            <div className="text-center py-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Fingerprint className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="text-white font-semibold mb-1">Biometric Auth</div>
              <div className="badge-medium inline-block mb-4">Setup Required</div>
              <button onClick={() => navigate('/biometric-verification')} className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Enable Now
              </button>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Recent Transactions</h3>
            <button onClick={() => navigate('/transaction-history')} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/receipt/${txn.id}`)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.status === 'success' ? 'bg-green-500/10' : txn.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                  <StatusIcon status={txn.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{txn.recipient}</div>
                  <div className="text-white/40 text-xs">{txn.type} • {format(new Date(txn.date), 'MMM d, yyyy')}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-semibold text-sm">₹{txn.amount.toLocaleString('en-IN')}</div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <StatusBadge status={txn.status} />
                    <RiskBadge level={txn.riskLevel} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
