import React, { useState } from "react";
import AdminView from "./AdminView";
import DriverView from "./DriverView";
import CustomerView from "./CustomerView";
import OwnerDashboard from "./OwnerDashboard";
import { useBerisStore } from "./store";

const App: React.FC = () => {
  const [view, setView] = useState<"admin" | "driver" | "customer" | "owner">("customer");
  const { loading } = useBerisStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl italic animate-bounce shadow-2xl shadow-blue-200 mb-6">B</div>
        <h2 className="text-xl font-black text-slate-900 italic tracking-tighter">MENYIAPKAN RADAR...</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Menghubungkan ke Beris-Cloud</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0 animate-in fade-in duration-700">
      {/* Top Header - Logo Only */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-blue-200">B</div>
          <span className="font-extrabold text-xl tracking-tighter text-slate-900 italic">BERIS RIDER</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasikmalaya</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {view === "admin" && <AdminView />}
        {view === "driver" && <DriverView />}
        {view === "customer" && <CustomerView />}
        {view === "owner" && <OwnerDashboard />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-3 z-50 flex justify-between items-center md:hidden pb-safe">
        <button onClick={() => setView("customer")} className={`flex flex-col items-center gap-1 transition-all ${view === "customer" ? "text-blue-600 scale-110" : "text-slate-400"}`}>
          <i className={`fa-solid fa-house-user text-lg`}></i>
          <span className="text-[9px] font-bold uppercase">Pesan</span>
        </button>
        <button onClick={() => setView("admin")} className={`flex flex-col items-center gap-1 transition-all ${view === "admin" ? "text-blue-600 scale-110" : "text-slate-400"}`}>
          <i className="fa-solid fa-headset text-lg"></i>
          <span className="text-[9px] font-bold uppercase">Admin</span>
        </button>
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center -mt-8 shadow-xl shadow-blue-200 border-4 border-white text-white" onClick={() => setView("driver")}>
          <i className="fa-solid fa-motorcycle text-xl"></i>
        </div>
        <button onClick={() => setView("owner")} className={`flex flex-col items-center gap-1 transition-all ${view === "owner" ? "text-blue-600 scale-110" : "text-slate-400"}`}>
          <i className="fa-solid fa-chart-pie text-lg"></i>
          <span className="text-[9px] font-bold uppercase">Laporan</span>
        </button>
        <button onClick={() => alert("Profil Driver Coming Soon!")} className="flex flex-col items-center gap-1 text-slate-400">
          <i className="fa-solid fa-circle-user text-lg"></i>
          <span className="text-[9px] font-bold uppercase">Profil</span>
        </button>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-20 bottom-0 w-20 bg-white border-r border-slate-100 flex-col items-center py-8 gap-8 z-40">
        <button onClick={() => setView("customer")} className={`p-3 rounded-xl transition-all ${view === "customer" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-300 hover:text-slate-600"}`} title="Pelanggan">
          <i className="fa-solid fa-user text-xl"></i>
        </button>
        <button onClick={() => setView("admin")} className={`p-3 rounded-xl transition-all ${view === "admin" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-300 hover:text-slate-600"}`} title="Admin">
          <i className="fa-solid fa-gauge-high text-xl"></i>
        </button>
        <button onClick={() => setView("driver")} className={`p-3 rounded-xl transition-all ${view === "driver" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-300 hover:text-slate-600"}`} title="Driver">
          <i className="fa-solid fa-motorcycle text-xl"></i>
        </button>
        <button onClick={() => setView("owner")} className={`p-3 rounded-xl transition-all ${view === "owner" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-300 hover:text-slate-600"}`} title="Owner">
          <i className="fa-solid fa-chart-line text-xl"></i>
        </button>
      </nav>
    </div>
  );
};

export default App;
