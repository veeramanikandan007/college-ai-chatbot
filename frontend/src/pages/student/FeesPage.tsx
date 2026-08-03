import { CreditCard, CheckCircle2, Download, AlertCircle, Clock } from 'lucide-react';

export default function FeesPage() {
  const transactions = [
    { id: 'TXN-2026-02', semester: 'Semester 5', amount: 45000, date: 'Pending', status: 'pending', dueDate: 'Nov 15, 2026' },
    { id: 'TXN-2025-08', semester: 'Semester 4', amount: 45000, date: 'Aug 10, 2025', status: 'paid' },
    { id: 'TXN-2025-01', semester: 'Semester 3', amount: 45000, date: 'Jan 15, 2025', status: 'paid' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#FAFAFA] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <CreditCard className="text-zinc-900 dark:text-zinc-100" size={28} />
            Fee Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Track your fee payments and download receipts.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-zinc-900 dark:bg-zinc-900 rounded-xl p-6 text-white shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-zinc-800">
            <div>
              <h3 className="font-heading text-sm font-medium opacity-80 mb-1">Total Outstanding</h3>
              <p className="font-heading text-3xl font-bold">₹45,000</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-md backdrop-blur-sm mt-4">
              <AlertCircle size={15} />
              <span>Due by Nov 15, 2026</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs flex flex-col justify-center items-center text-center min-h-[160px]">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3">
              <CreditCard className="text-zinc-900 dark:text-zinc-100 w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3">Pay Next Semester Fee</h3>
            <button className="h-9 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium transition-all duration-180">
              Proceed to Pay
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-heading font-bold text-section text-[#1F2937] dark:text-[#F8FAFC] mb-4">Payment History</h2>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#334155] overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {transactions.map((txn) => (
              <div key={txn.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">{txn.semester} Fee</h3>
                    {txn.status === 'paid' ? (
                      <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <span className="font-heading text-caption font-bold uppercase tracking-[0.02em] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-small text-[#64748B] dark:text-[#94A3B8]">Transaction ID: {txn.id}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 shrink-0">
                  <div className="text-right">
                    <p className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC]">₹{txn.amount.toLocaleString()}</p>
                    <p className="text-small text-[#64748B] dark:text-[#94A3B8]">{txn.date}</p>
                  </div>
                  
                  {txn.status === 'paid' && (
                    <button 
                      className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0E2A6D] dark:hover:text-[#60A5FA] hover:bg-[#F5F7FB] dark:hover:bg-[#0F172A] rounded-lg transition-colors" 
                      title="Download Receipt"
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
