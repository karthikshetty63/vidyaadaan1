import React, { useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import DonationTable from "../../../components/dashboard/DonationTable";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const donationSummary = [
  { icon: "💰", label: "Total Donations Received", value: "₹4,82,000", change: 18, color: "emerald" },
  { icon: "📅", label: "Monthly Donations (July)", value: "₹85,000", change: 12, color: "blue" },
  { icon: "🏆", label: "Highest Single Donation", value: "₹50,000", change: 0, color: "amber" },
  { icon: "❤️", label: "Active Donors", value: "42 Donors", change: 8, color: "purple" },
];

const mockDonations = [
  { name: "Ramesh Kumar", sub: "Individual Donor", amount: 5000, date: "27 Jul 2026", purpose: "Sports Day Medals & Trophies", status: "Completed" },
  { name: "Shiksha Seva Foundation", sub: "NGO Partner", amount: 25000, date: "25 Jul 2026", purpose: "Smart Board Installation", status: "Verified" },
  { name: "Priya Mehta", sub: "CSR Contributor", amount: 10000, date: "22 Jul 2026", purpose: "RO Water Purifier Unit", status: "Verified" },
  { name: "Tech Corp India Ltd", sub: "Corporate CSR", amount: 50000, date: "18 Jul 2026", purpose: "Rooftop Solar Panel Battery", status: "Completed" },
  { name: "Anand Sharma", sub: "Alumni Donor", amount: 15000, date: "10 Jul 2026", purpose: "Library Books (200+ Books)", status: "Completed" },
];

const DonationHistory = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="Donation History & Escrow Ledger" subtitle={profile.name} notifications={[1, 2]}>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold mb-1 border border-emerald-200">
              <span>💰</span> Financial Transparency
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Donation History & Ring-Fenced Ledger</h1>
            <p className="text-xs text-slate-500">Track all direct donor contributions, CSR funds, and 80G verified tax receipts.</p>
          </div>

          <button
            onClick={() => alert("Exported official VIDYADAAN donation ledger CSV.")}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>📊</span> Export Financial CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {donationSummary.map((card) => (
            <div key={card.label} className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +{card.change}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">{card.label}</span>
                <span className="text-xl font-black text-slate-900">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ledger Table */}
        <DonationTable rows={mockDonations} title="Verified Project & Event Financial Ledger" />

      </main>
    </DashboardLayout>
  );
};

export default DonationHistory;
