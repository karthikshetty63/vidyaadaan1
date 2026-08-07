import React from "react";

const methodIcons = {
  "UPI": "📱",
  "CSR": "💼",
  "Credit": "💳",
  "Debit": "💳",
  "Net Banking": "🏦",
  "Stripe": "🌐",
};

const getMethodIcon = (method) => {
  for (const [key, icon] of Object.entries(methodIcons)) {
    if (method.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "💳";
};

const PaymentTransparencyPanel = ({ payments, targetBudget, raisedAmount }) => {
  const progressPct = Math.min(100, Math.round((raisedAmount / targetBudget) * 100));

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-[24px] p-6 text-white shadow-xl shadow-blue-700/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Project Budget</p>
            <p className="text-3xl font-black mt-0.5">
              ₹{raisedAmount.toLocaleString("en-IN")}
              <span className="text-blue-300 text-base font-bold"> / ₹{targetBudget.toLocaleString("en-IN")}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black">{progressPct}%</p>
              <p className="text-blue-200 text-[10px] font-bold">Funded</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{payments.length}</p>
              <p className="text-blue-200 text-[10px] font-bold">Transactions</p>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-3 bg-blue-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-blue-300 font-bold">Ring-Fenced Escrow Account</span>
          <span className="text-[10px] font-black text-emerald-300">🔒 100% Secured</span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-lg">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Payment Audit Ledger</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Every transaction is publicly auditable</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-full">
            🔒 All Verified
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {payments.map((txn, idx) => (
            <div key={txn.txnId} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-lg shrink-0">
                    {getMethodIcon(txn.method)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900">
                        {txn.anonymous ? "Anonymous Donor" : txn.donorName}
                      </span>
                      {txn.anonymous && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full">
                          Privacy Protected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-mono text-blue-600 font-bold">{txn.txnId}</span>
                      <span className="text-[10px] text-slate-400">{txn.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{txn.method} • {txn.milestone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900">
                      ₹{txn.amount.toLocaleString("en-IN")}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      ✓ {txn.status}
                    </span>
                  </div>
                  <button
                    onClick={() => alert(`Downloading 80G Receipt: ${txn.receiptNo}`)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded-full border border-blue-100 transition-colors whitespace-nowrap"
                  >
                    📜 Receipt {txn.receiptNo}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Total Collected</span>
          <span className="text-base font-black text-slate-900">
            ₹{payments.reduce((sum, t) => sum + t.amount, 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Escrow Info Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-[20px] p-5 flex items-start gap-4">
        <span className="text-2xl shrink-0">🏛️</span>
        <div>
          <h5 className="font-extrabold text-emerald-900 text-sm">Ring-Fenced Escrow Account</h5>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            All donations are held in a dedicated escrow account. Funds are released to suppliers only upon milestone verification by the assigned NGO inspector — ensuring zero misuse of funds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTransparencyPanel;
