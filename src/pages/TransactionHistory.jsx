import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Search, Filter, Download, ArrowUpRight,
  CheckCircle, Clock, XCircle, Shield, FileText, QrCode,
  Calendar, IndianRupee, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { getTransactions } from '../utils/storage';

const StatusBadge = ({ status }) => {
  const configs = {
    success: { label: 'Successful', cls: 'badge-success', icon: CheckCircle },
    pending: { label: 'Pending', cls: 'badge-pending', icon: Clock },
    failed: { label: 'Failed', cls: 'badge-failed', icon: XCircle },
  };
  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  return (
    <span className={`${config.cls} inline-flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const RiskBadge = ({ level }) => {
  const configs = {
    low: { label: 'Low Risk', cls: 'badge-low' },
    medium: { label: 'Medium Risk', cls: 'badge-medium' },
    high: { label: 'High Risk', cls: 'badge-high' },
  };
  const config = configs[level] || configs.low;
  return (
    <span className={`${config.cls} inline-flex items-center gap-1`}>
      <Shield className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(() => getTransactions());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch =
        (t.recipient || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.upiId || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.type || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchRisk = riskFilter === 'all' || t.riskLevel === riskFilter;

      return matchSearch && matchStatus && matchRisk;
    });
  }, [transactions, search, statusFilter, riskFilter]);

  const stats = useMemo(() => {
    const totalSuccess = transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const count = transactions.length;
    const avg = count > 0 ? Math.round(totalSuccess / (transactions.filter(t => t.status === 'success').length || 1)) : 0;
    return { totalSuccess, count, avg };
  }, [transactions]);

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Recipient', 'UPI ID', 'Amount (INR)', 'Type', 'Status', 'Risk Level', 'Invoice No', 'Date'];
    const rows = filtered.map(t => [
      t.id,
      `"${t.recipient || ''}"`,
      t.upiId || '',
      t.amount || 0,
      `"${t.type || ''}"`,
      t.status || '',
      t.riskLevel || '',
      `"${t.invoiceNo || ''}"`,
      t.date ? new Date(t.date).toISOString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BioPay_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshData = () => {
    setTransactions(getTransactions());
  };

  return (
    <Layout title="Transaction History">
      <div className="space-y-6">
        {/* Top Summary Header */}
        <div className="glass-card p-6 border-gradient">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Transaction Ledger</h2>
                <p className="text-white/40 text-xs">Simulated payment history with AI risk tags & digital receipts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                title="Refresh Transactions"
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/5">
            <div>
              <div className="text-white/40 text-xs">Total Settled</div>
              <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-0.5">
                ₹{stats.totalSuccess.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-white/40 text-xs">Total Records</div>
              <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {stats.count}
              </div>
            </div>
            <div>
              <div className="text-white/40 text-xs">Avg. Transaction</div>
              <div className="text-lg sm:text-xl font-bold text-blue-400 mt-0.5">
                ₹{stats.avg.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by recipient, ID, UPI, or invoice..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-xs sm:text-sm py-2.5"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['all', 'success', 'pending', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 border-l border-white/10 pl-2">
              <span className="text-[11px] text-white/30 hidden lg:inline">Risk:</span>
              {['all', 'low', 'medium', 'high'].map(risk => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                    riskFilter === risk
                      ? 'bg-white/15 text-white border border-white/30'
                      : 'bg-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List / Table */}
        <div className="glass-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-white/30">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-white font-medium text-base mb-1">No Transactions Found</h3>
              <p className="text-white/40 text-xs max-w-sm mx-auto mb-5">
                No simulated transactions match your current search or filter criteria.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setRiskFilter('all'); }}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => navigate('/qr-scanner')}
                  className="btn-primary py-2 px-4 text-xs"
                >
                  New Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Header on medium screens */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/[0.02] text-xs font-medium text-white/40 uppercase tracking-wider">
                <div className="col-span-4">Recipient & Reference</div>
                <div className="col-span-2">Type / Method</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Status & Risk</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Rows */}
              {filtered.map(txn => {
                const formattedDate = txn.date
                  ? format(new Date(txn.date), 'MMM d, yyyy • h:mm a')
                  : 'Recent';

                return (
                  <div
                    key={txn.id}
                    className="p-4 sm:px-6 hover:bg-white/[0.03] transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center cursor-pointer"
                    onClick={() => navigate(`/receipt/${txn.id}`)}
                  >
                    {/* Recipient */}
                    <div className="col-span-4 flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        {txn.type?.toLowerCase().includes('qr') ? (
                          <QrCode className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm font-semibold truncate flex items-center gap-2">
                          {txn.recipient || 'Unknown Recipient'}
                        </div>
                        <div className="text-white/40 text-xs flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{txn.id}</span>
                          {txn.invoiceNo && txn.invoiceNo !== 'N/A' && (
                            <>
                              <span>•</span>
                              <span className="truncate">{txn.invoiceNo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Type and Date */}
                    <div className="col-span-2 w-full md:w-auto flex md:flex-col justify-between md:justify-center items-center md:items-start text-xs">
                      <span className="text-white/70">{txn.type || 'Direct Payment'}</span>
                      <span className="text-white/30 text-[11px]">{formattedDate}</span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 w-full md:w-auto flex md:flex-col justify-between md:justify-center items-center md:items-end">
                      <span className="text-white/40 text-xs md:hidden">Amount:</span>
                      <div className="text-white font-bold text-sm sm:text-base">
                        ₹{Number(txn.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Status & Risk */}
                    <div className="col-span-2 w-full md:w-auto flex md:flex-col items-center md:items-center justify-between md:justify-center gap-1.5">
                      <StatusBadge status={txn.status} />
                      <RiskBadge level={txn.riskLevel || 'low'} />
                    </div>

                    {/* Action */}
                    <div className="col-span-2 w-full md:w-auto flex justify-end items-center pt-2 md:pt-0 border-t border-white/5 md:border-t-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/receipt/${txn.id}`);
                        }}
                        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 hover:border-cyan-500/40 hover:text-cyan-400 w-full md:w-auto justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Receipt
                        <ChevronRight className="w-3 h-3 text-white/30" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
