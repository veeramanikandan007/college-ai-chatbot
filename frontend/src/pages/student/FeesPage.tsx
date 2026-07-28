import { CreditCard, CheckCircle2, Download, AlertCircle, Clock } from 'lucide-react';

export default function FeesPage() {
  const transactions = [
    { id: 'TXN-2026-02', semester: 'Semester 5', amount: 45000, date: 'Pending', status: 'pending', dueDate: 'Nov 15, 2026' },
    { id: 'TXN-2025-08', semester: 'Semester 4', amount: 45000, date: 'Aug 10, 2025', status: 'paid' },
    { id: 'TXN-2025-01', semester: 'Semester 3', amount: 45000, date: 'Jan 15, 2025', status: 'paid' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="text-[#0A2A6A]" />
            Fee Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track your fee payments and download receipts.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-gradient-to-br from-[#0A2A6A] to-[#163D8C] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <h3 className="font-medium text-blue-200 mb-1">Total Outstanding</h3>
            <p className="text-4xl font-bold mb-4">₹45,000</p>
            <div className="flex items-center gap-2 text-sm text-blue-100 bg-black/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <AlertCircle size={16} />
              <span>Due by Nov 15, 2026</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-[#163D8C]/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="text-[#163D8C] w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Pay Next Semester Fee</h3>
            <button className="bg-[#E8B24D] hover:bg-amber-500 text-[#0A2A6A] font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors">
              Proceed to Pay
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Payment History</h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
          {transactions.map(txn => (
            <div key={txn.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 dark:text-white">{txn.semester} Fee</h3>
                  {txn.status === 'paid' ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Paid
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Transaction ID: {txn.id}</p>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0">
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-white">₹{txn.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{txn.date}</p>
                </div>
                
                {txn.status === 'paid' && (
                  <button className="p-2 text-slate-400 hover:text-[#163D8C] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Download Receipt">
                    <Download size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
