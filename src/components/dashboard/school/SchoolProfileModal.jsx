import React, { useState } from "react";

const SchoolProfileModal = ({ isOpen, onClose, schoolData, onSave }) => {
  const [name, setName] = useState(schoolData?.name || "Honnali Govt. Primary School");
  const [udise, setUdise] = useState(schoolData?.udise || "29140112801");
  const [district, setDistrict] = useState(schoolData?.district || "Davangere District, Karnataka");
  const [principal, setPrincipal] = useState(schoolData?.principal || "Principal Suresh Kumar");
  const [phone, setPhone] = useState(schoolData?.phone || "+91 98765 43210");
  const [email, setEmail] = useState(schoolData?.email || "honnali.gps@karnataka.gov.in");
  const [students, setStudents] = useState(schoolData?.students || 438);
  const [teachers, setTeachers] = useState(schoolData?.teachers || 18);
  const [established, setEstablished] = useState(schoolData?.established || "1984");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave &&
      onSave({
        name,
        udise,
        district,
        principal,
        phone,
        email,
        students: Number(students),
        teachers: Number(teachers),
        established,
      });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden my-6 z-10">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏫</span>
            <div>
              <h3 className="font-extrabold text-base">Edit School Profile</h3>
              <p className="text-xs text-blue-100">Update verified government school credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UDISE Code *</label>
              <input
                type="text"
                required
                value={udise}
                onChange={(e) => setUdise(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">District / Location *</label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Principal Name *</label>
              <input
                type="text"
                required
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Students</label>
              <input
                type="number"
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Teachers</label>
              <input
                type="number"
                value={teachers}
                onChange={(e) => setTeachers(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Established Year</label>
              <input
                type="text"
                value={established}
                onChange={(e) => setEstablished(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolProfileModal;
