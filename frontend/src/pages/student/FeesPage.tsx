import { CreditCard, CheckCircle2, Download, AlertCircle, Clock } from 'lucide-react';

export default function FeesPage() {
  const transactions = [
    { id: 'TXN-2026-02', semester: 'Semester 5', amount: 45000, date: 'Pending', status: 'pending', dueDate: 'Nov 15, 2026' },
    { id: 'TXN-2025-08', semester: 'Semester 4', amount: 45000, date: 'Aug 10, 2025', status: 'paid' },
    { id: 'TXN-2025-01', semester: 'Semester 3', amount: 45000, date: 'Jan 15, 2025', status: 'paid' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F5F7FB] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 font-body">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-page tracking-[0.02em] text-[#0E2A6D] dark:text-[#F8FAFC] flex items-center gap-3">
            <CreditCard className="text-[#0E2A6D] dark:text-[#60A5FA]" size={32} />
            Fee Management
          </h1>
          <p className="text-small text-[#64748B] dark:text-[#94A3B8] mt-1">Track your fee payments and download receipts.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gradient-to-br from-[#0E2A6D] to-[#1E4DB7] rounded-xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-[#D9A441]/30">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div>
              <h3 className="font-heading text-card font-bold opacity-90 mb-1">Total Outstanding</h3>
              <p className="font-heading text-hero font-extrabold">₹45,000</p>
            </div>
            <div className="flex items-center gap-2 text-small font-semibold bg-black/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm mt-4">
              <AlertCircle size={16} />
              <span>Due by Nov 15, 2026</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-6 shadow-xs flex flex-col justify-center items-center text-center min-h-[160px]">
            <div className="w-12 h-12 bg-[#0E2A6D]/10 dark:bg-[#60A5FA]/10 rounded-xl flex items-center justify-center mb-3">
              <CreditCard className="text-[#0E2A6D] dark:text-[#60A5FA] w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-card text-[#1F2937] dark:text-[#F8FAFC] mb-3">Pay Next Semester Fee</h3>
            <button className="h-10 px-6 rounded-xl bg-[#0E2A6D] hover:bg-[#153B8A] text-white text-small font-btn shadow-sm transition-all duration-180">
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
