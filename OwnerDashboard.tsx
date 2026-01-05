
import React, { useState } from 'react';
import { useBerisStore } from './store';
import { Card, VehicleIcon } from './components';
import { suggestOperationalStrategy } from './GeminiService';
// Import OrderStatus from types to resolve usage in filtering cancelled orders
import { OrderStatus } from './types';

const OwnerDashboard: React.FC = () => {
  const { getStats, orders } = useBerisStore();
  const stats = getStats();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const generateBusinessAnalysis = async () => {
    setIsAnalyzing(true);
    const report = await suggestOperationalStrategy(orders);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">OWNER DASHBOARD 📈</h1>
          <p className="text-slate-500 font-medium">Laporan Pertumbuhan Beris Rider Tasikmalaya</p>
        </div>
        <button 
          onClick={generateBusinessAnalysis}
          disabled={isAnalyzing}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <i className={`fa-solid fa-wand-magic-sparkles ${isAnalyzing ? 'animate-spin' : ''}`}></i>
          {isAnalyzing ? 'Menganalisis Data...' : 'AI Business Review'}
        </button>
      </div>

      {aiReport && (
        <Card className="bg-indigo-600 border-none text-white p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl shrink-0">
              <i className="fa-solid fa-brain"></i>
            </div>
            <div>
              <h3 className="font-black text-lg mb-2">Analisis AI untuk Bisnis Anda:</h3>
              <p className="text-indigo-100 text-sm leading-relaxed italic">{aiReport}</p>
              <button 
                onClick={() => setAiReport(null)}
                className="mt-4 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
          <i className="fa-solid fa-chart-line absolute -bottom-4 -right-4 text-9xl text-white/5 rotate-12"></i>
        </Card>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white p-5 border-slate-200 hover:shadow-lg transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Omzet Kotor</p>
          <h2 className="text-2xl font-black text-slate-900">Rp {stats.revenue.toLocaleString('id-ID')}</h2>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-green-500 font-bold">
             <i className="fa-solid fa-arrow-trend-up"></i> +100% Growth
          </div>
        </Card>

        <Card className="bg-white p-5 border-slate-200 hover:shadow-lg transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Biaya (Kas)</p>
          <h2 className="text-2xl font-black text-red-600">Rp {stats.totalExpenses.toLocaleString('id-ID')}</h2>
          <div className="mt-2 text-[10px] text-slate-400 font-bold">Pengeluaran Armada</div>
        </Card>

        <Card className="bg-slate-900 p-5 border-none shadow-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Laba Bersih</p>
          <h2 className="text-2xl font-black text-white">Rp {stats.netProfit.toLocaleString('id-ID')}</h2>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 font-bold">
             <i className="fa-solid fa-coins"></i> Dana Tersedia
          </div>
        </Card>

        <Card className="bg-white p-5 border-slate-200 hover:shadow-lg transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trip Selesai</p>
          <h2 className="text-2xl font-black text-slate-900">{stats.completed}</h2>
          <div className="mt-2 text-[10px] text-slate-400 font-bold">Dari {stats.total} Order</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Driver Performance Table */}
        <Card className="bg-white p-0 overflow-hidden border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Performa & Margin Driver</h3>
            <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-full font-bold text-slate-400 uppercase">Analisis Per Driver</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4 text-center">Omzet</th>
                  <th className="px-6 py-4 text-center text-red-400">Biaya</th>
                  <th className="px-6 py-4 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.driverStats.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-500">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{d.name}</p>
                          <div className="flex items-center gap-1">
                             <VehicleIcon type={d.vehicleType} />
                             <span className="text-[10px] text-slate-400 font-bold uppercase">{d.vehiclePlate}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-slate-700">Rp {d.totalEarnings.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-red-500">Rp {d.totalExpenses.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-blue-600">Rp {(d.totalEarnings - d.totalExpenses).toLocaleString('id-ID')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Operational Efficiency Card */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white p-6 border-none shadow-2xl relative">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-bullseye text-orange-500"></i>
              Target Skalabilitas
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                  <span>Target 100 Order/Hari</span>
                  <span className="text-orange-400">{Math.round((stats.completed / 100) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (stats.completed / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest text-slate-400">
                  <span>Armada Online (24h)</span>
                  <span>{stats.driverStats.filter(d => d.isOnline).length} / {stats.driverStats.length}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${(stats.driverStats.filter(d => d.isOnline).length / stats.driverStats.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Aktivitas</p>
                <p className="text-sm font-bold text-green-400">{stats.active} Aktif</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Batal/Gagal</p>
                <p className="text-sm font-bold text-red-400">{orders.filter(o => o.status === OrderStatus.CANCELLED).length} Trip</p>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-600 text-white p-6 border-none shadow-xl">
             <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
                    <i className="fa-solid fa-rocket"></i>
                </div>
                <div>
                    <h4 className="font-bold">Efisiensi Kas</h4>
                    <p className="text-xs text-blue-100">Buku Kas membantu Anda melihat margin nyata setelah BBM & Parkir.</p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
