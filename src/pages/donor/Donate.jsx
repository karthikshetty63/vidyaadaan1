import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import schoolsData from "../../data/schoolsData";
import { FaCheckCircle, FaArrowLeft, FaLock } from "react-icons/fa";

const presets = [500, 1000, 2500, 5000, 10000, 25000];

const Donate = () => {
  const [params] = useSearchParams();
  const schoolId = Number(params.get("school")) || 1;
  const school = schoolsData.find((s) => s.id === schoolId) || schoolsData[0];

  const [amount, setAmount] = useState("");
  const [custom, setCustom] = useState("");
  const [step, setStep] = useState(1); // 1 = select, 2 = confirm, 3 = success
  const [message, setMessage] = useState("");

  const finalAmount = amount || custom;

  const handlePreset = (val) => {
    setAmount(String(val));
    setCustom("");
  };

  const handleCustom = (e) => {
    setCustom(e.target.value);
    setAmount("");
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!finalAmount || Number(finalAmount) < 1) return;
    setStep(2);
  };

  const handlePay = () => {
    setStep(3);
  };

  /* Success screen */
  if (step === 3) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <FaCheckCircle className="text-4xl text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Donation Successful!</h2>
          <p className="text-slate-500 mt-2 text-sm leading-6">
            Thank you for donating <strong className="text-emerald-600">₹{Number(finalAmount).toLocaleString()}</strong> to{" "}
            <strong>{school.name}</strong>. Your contribution will make a real difference.
          </p>
          <div className="flex gap-3 justify-center mt-7">
            <Link to="/donor/donation-history">
              <Button variant="outline">View History</Button>
            </Link>
            <Link to="/donor/browse">
              <Button>Donate Again</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <Link
        to={`/donor/school/${school.id}`}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <FaArrowLeft size={11} /> Back to School
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Make a Donation</h1>
        <p className="text-slate-500 text-sm mt-1">
          Supporting: <strong className="text-slate-700">{school.name}</strong>
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleConfirm} className="space-y-6">
          {/* School Card */}
          <Card className="p-5 flex items-center gap-4">
            <img src={school.image} alt={school.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">{school.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{school.location}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {school.raised} raised of {school.required}
              </p>
            </div>
          </Card>

          {/* Amount Selection */}
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-4">Select Amount</h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                    amount === String(p)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 text-slate-700 hover:border-blue-400"
                  }`}
                >
                  ₹{p.toLocaleString()}
                </button>
              ))}
            </div>

            <Input
              label="Or enter custom amount (₹)"
              id="custom"
              name="custom"
              type="number"
              placeholder="e.g. 3000"
              value={custom}
              onChange={handleCustom}
              min="1"
            />
          </Card>

          {/* Message */}
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-3">Leave a Message (Optional)</h2>
            <textarea
              rows={3}
              placeholder="Write an encouraging message for the school..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
            />
          </Card>

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!finalAmount || Number(finalAmount) < 1}
          >
            Continue to Confirm
          </Button>
        </form>
      )}

      {step === 2 && (
        <Card className="p-7 space-y-5">
          <h2 className="font-bold text-slate-800 text-lg">Confirm Donation</h2>

          <div className="bg-slate-50 rounded-xl p-5 space-y-3 text-sm">
            {[
              { label: "School", value: school.name },
              { label: "Location", value: school.location },
              { label: "Donation Amount", value: `₹${Number(finalAmount).toLocaleString()}` },
              { label: "Message", value: message || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-slate-400 shrink-0">{label}</span>
                <span className="font-semibold text-slate-800 text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-emerald-50 rounded-xl px-4 py-3">
            <FaLock className="text-emerald-500 shrink-0" />
            This is a demo. No real payment will be processed.
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              Edit
            </Button>
            <Button size="lg" fullWidth onClick={handlePay}>
              Confirm & Pay ₹{Number(finalAmount).toLocaleString()}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Donate;
