import React, { useState } from "react";

const paymentMethods = [
  { id: "gpay", name: "Google Pay", icon: "🟢", category: "UPI" },
  { id: "phonepe", name: "PhonePe", icon: "🟣", category: "UPI" },
  { id: "paytm", name: "Paytm UPI", icon: "🔵", category: "UPI" },
  { id: "bhim", name: "BHIM UPI", icon: "🇮🇳", category: "UPI" },
  { id: "card", name: "Credit / Debit Card", icon: "💳", category: "Card" },
  { id: "netbanking", name: "Net Banking (All Indian Banks)", icon: "🏦", category: "Bank" },
  { id: "razorpay", name: "Razorpay Checkout", icon: "⚡", category: "Gateway" },
  { id: "stripe", name: "Stripe International", icon: "🌐", category: "Gateway" },
  { id: "csr", name: "CSR Corporate Transfer", icon: "💼", category: "Corporate" },
  { id: "bank", name: "Direct Bank Transfer (NEFT/RTGS)", icon: "🏛️", category: "Bank" },
];

const PaymentFlowModal = ({ isOpen, onClose, targetItem = null, onSuccess = null }) => {
  const [step, setStep] = useState(1); // 1: Type/Amount, 2: Payment Method, 3: Review, 4: Processing, 5: Success
  const [donationType, setDonationType] = useState("money"); // "money", "items", "event", "child"
  const [amount, setAmount] = useState(targetItem?.amount || 2500);
  const [selectedMethod, setSelectedMethod] = useState("gpay");
  const [donorName, setDonorName] = useState("Ramesh Kumar");
  const [donorEmail, setDonorEmail] = useState("ramesh.donor@gmail.com");
  const [donorPan, setDonorPan] = useState("ABCDE1234F");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState(null);

  if (!isOpen) return null;

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setStep(4);

    setTimeout(() => {
      const generatedTxn = {
        txnId: `TXN-${Date.now().toString().slice(-8)}`,
        receiptNo: `VD-80G-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: Number(amount),
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        method: paymentMethods.find((m) => m.id === selectedMethod)?.name || "UPI",
        donorName: isAnonymous ? "Anonymous Donor" : donorName,
        pan: donorPan,
        schoolName: targetItem?.schoolName || "Honnali Govt. Primary School",
        purpose: targetItem?.title || "Classroom Infrastructure & Smart TV Upgrade",
      };

      setReceiptTxn(generatedTxn);
      setStep(5);
      if (onSuccess) onSuccess(generatedTxn);
    }, 1500);
  };

  const downloadReceipt = () => {
    const receiptText = `================================================
VIDYADAAN - 80G TAX DEDUCTION RECEIPT
================================================
Receipt No: ${receiptTxn?.receiptNo}
Transaction ID: ${receiptTxn?.txnId}
Date: ${receiptTxn?.date}

Donor Name: ${receiptTxn?.donorName}
PAN Number: ${receiptTxn?.pan}
Amount Donated: ₹${receiptTxn?.amount?.toLocaleString("en-IN")}
Payment Method: ${receiptTxn?.method}

Beneficiary School: ${receiptTxn?.schoolName}
Project Purpose: ${receiptTxn?.purpose}
Verification Status: Escrow Ring-Fenced Account

Thank you for empowering Government School children!
================================================`;

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VIDYADAAN_80G_Receipt_${receiptTxn?.receiptNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold">
              💙
            </div>
            <div>
              <h3 className="font-extrabold text-base">Secure Transparency Checkout</h3>
              <p className="text-[11px] text-blue-100 font-medium">100% Tax Deductible under Section 80G</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between px-8 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500">
            <span className={step >= 1 ? "text-blue-600" : ""}>1. Amount</span>
            <span>→</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>2. Payment Method</span>
            <span>→</span>
            <span className={step >= 3 ? "text-blue-600" : ""}>3. Review & Pay</span>
          </div>
        )}

        {/* Body Steps */}
        <div className="p-6 sm:p-8">

          {/* STEP 1: Donation Type & Amount */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Select Contribution Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "money", label: "💵 Money Contribution", sub: "Direct Escrow Fund" },
                    { id: "items", label: "📦 School Items", sub: "Benches, Books, Kits" },
                    { id: "event", label: "🎟️ Sponsor Event Item", sub: "Food, Medals, Stage" },
                    { id: "child", label: "👧 Sponsor a Child", sub: "Bicycle, Uniform, Fees" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDonationType(t.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        donationType === t.id
                          ? "border-blue-600 bg-blue-50/70 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-extrabold text-slate-900">{t.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{t.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Enter Contribution Amount (₹)
                </label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-3.5 text-base font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-13 pl-9 pr-4 border-2 border-slate-200 rounded-2xl text-lg font-black focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  {[1000, 2500, 5000, 15000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        Number(amount) === amt
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Donor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full h-11 px-3.5 border-2 border-slate-200 rounded-xl text-xs font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">PAN (Required for 80G Tax Cert)</label>
                  <input
                    type="text"
                    value={donorPan}
                    onChange={(e) => setDonorPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full h-11 px-3.5 border-2 border-slate-200 rounded-xl text-xs font-medium uppercase focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="text-xs text-slate-600 font-medium">Donate Anonymously</span>
                </label>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-12 px-7 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all"
                >
                  Select Payment Method →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Methods */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Choose Secure Payment Gateway / Method
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      selectedMethod === m.id
                        ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{m.icon}</span>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900">{m.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{m.category}</p>
                      </div>
                    </div>
                    {selectedMethod === m.id && <span className="text-emerald-600 font-black text-xs">✓</span>}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-2">
                <span>🛡️</span>
                <span>All transactions use ring-fenced escrow accounts with zero overhead deduction.</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-5 border-2 border-slate-200 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-12 px-7 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-blue-600/25 transition-all"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2.5 text-xs">
                <div className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 flex justify-between">
                  <span>Donation Summary</span>
                  <span className="text-blue-600">80G Tax Eligible</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target School:</span>
                  <span className="font-bold text-slate-900">{targetItem?.schoolName || "Honnali Govt. Primary School"}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Purpose:</span>
                  <span className="font-bold text-slate-900">{targetItem?.title || "Classroom Infrastructure Upgrade"}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Donor Name:</span>
                  <span className="font-bold text-slate-900">{isAnonymous ? "Anonymous Donor" : donorName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PAN Number:</span>
                  <span className="font-bold text-slate-900">{donorPan}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-slate-900">{paymentMethods.find((m) => m.id === selectedMethod)?.name}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-emerald-600">₹{Number(amount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-full shadow-xl shadow-emerald-600/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                🔒 Confirm & Pay ₹{Number(amount).toLocaleString("en-IN")}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-xs text-slate-500 font-semibold hover:underline"
              >
                Change Payment Method
              </button>
            </div>
          )}

          {/* STEP 4: Processing */}
          {step === 4 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Processing Secure Escrow Transfer...</h4>
                <p className="text-xs text-slate-500 mt-1">Connecting to {paymentMethods.find((m) => m.id === selectedMethod)?.name}</p>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Live Journey Start */}
          {step === 5 && receiptTxn && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto animate-bounce">
                🎉
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Payment Successful!</h3>
                <p className="text-xs text-slate-600">
                  Your donation of <strong>₹{receiptTxn.amount.toLocaleString("en-IN")}</strong> has been received and mapped to <strong>{receiptTxn.schoolName}</strong>.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>80G Receipt No:</span>
                  <span>{receiptTxn.receiptNo}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-[11px]">{receiptTxn.txnId}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Verification Status:</span>
                  <span className="font-semibold text-emerald-700">✓ Escrow Ring-Fenced</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadReceipt}
                  className="flex-1 h-12 bg-white border-2 border-emerald-600 text-emerald-700 font-bold text-xs rounded-full hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>📜</span> Download 80G Tax Receipt
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>📍</span> Track Live Donation Journey
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentFlowModal;
