
import React, { useState, useEffect, useRef } from 'react';
import { useBerisStore } from './store';
import { Card, Badge, VehicleIcon, SubscriptionBadge } from './components';
import { OrderStatus, ExpenseCategory, VehicleType, Driver } from './types';
import { analyzeOrderForResponse } from './GeminiService';

const DriverView: React.FC = () => {
  const { orders, drivers, expenses, updateOrderStatus, toggleDriverStatus, addExpense } = useBerisStore();
  
  const [activeDriverId, setActiveDriverId] = useState<string | null>(() => {
    return localStorage.getItem('beris_active_driver_id');
  });
  
  const [isAIGenerating, setIsAIGenerating] = useState<string | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'kas'>('orders');
  const [tempProofImage, setTempProofImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newExpense, setNewExpense] = useState({
    category: ExpenseCategory.FUEL,
    amount: 0,
    note: ''
  });

  useEffect(() => {
    if (activeDriverId) {
      localStorage.setItem('beris_active_driver_id', activeDriverId);
    } else {
      localStorage.removeItem('beris_active_driver_id');
    }
  }, [activeDriverId]);

  const activeDriver = drivers.find(d => d.id === activeDriverId);
  const isCar = activeDriver?.vehicleType === VehicleType.CAR;
  const themeColor = isCar ? 'bg-blue-600' : 'bg-emerald-600';
  const themeText = isCar ? 'text-blue-600' : 'text-emerald-600';
  const themeBgLight = isCar ? 'bg-blue-50' : 'bg-emerald-50';

  const currentOrders = orders.filter(o => o.driverId === activeDriverId && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);
  
  const today = new Date().setHours(0,0,0,0);
  const driverTodayExpenses = expenses.filter(e => e.driverId === activeDriverId && e.createdAt >= today);
  const totalTodayExpenses = driverTodayExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const driverTodayCompleted = orders.filter(o => o.driverId === activeDriverId && o.status === OrderStatus.COMPLETED && o.createdAt >= today);
  const totalTodayEarnings = driverTodayCompleted.reduce((acc, curr) => acc + curr.price, 0);

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStatus = (orderId: string, currentStatus: OrderStatus) => {
    if (!activeDriverId) return;
    let nextStatus = currentStatus;
    
    if (currentStatus === OrderStatus.ASSIGNED) {
      nextStatus = OrderStatus.PICKING_UP;
    } else if (currentStatus === OrderStatus.PICKING_UP) {
      nextStatus = OrderStatus.ON_TRIP;
    } else if (currentStatus === OrderStatus.ON_TRIP) {
      // For ON_TRIP to COMPLETED, check if proof is needed
      if (!tempProofImage) {
        alert("Silakan ambil foto bukti perjalanan/penumpang dulu ya Kang!");
        fileInputRef.current?.click();
        return;
      }
      nextStatus = OrderStatus.COMPLETED;
    }
    
    updateOrderStatus(orderId, nextStatus, activeDriverId, tempProofImage || undefined);
    setTempProofImage(null);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriverId) return;
    addExpense({ ...newExpense, driverId: activeDriverId });
    setNewExpense({ category: ExpenseCategory.FUEL, amount: 0, note: '' });
    setShowExpenseModal(false);
  };

  const generateWhatsAppMessage = async (orderId: string) => {
      setIsAIGenerating(orderId);
      const order = orders.find(o => o.id === orderId);
      if (order) {
          const msg = await analyzeOrderForResponse(order);
          alert(`Saran Pesan WhatsApp untuk Pelanggan:\n\n"${msg}"\n\n(Pesan ini bisa dicopy ke WhatsApp)`);
      }
      setIsAIGenerating(null);
  };

  if (!activeDriverId || !activeDriver) {
    const carDrivers = drivers.filter(d => d.vehicleType === VehicleType.CAR);
    const motorDrivers = drivers.filter(d => d.vehicleType === VehicleType.MOTORCYCLE);

    return (
      <div className="max-w-md mx-auto space-y-8 py-8 animate-in fade-in duration-500 px-4">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black italic mx-auto shadow-xl shadow-blue-200 mb-4">B</div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Mulai Shift Baru 🚀</h1>
           <p className="text-slate-500 text-sm font-medium">Pilih namamu untuk mulai bekerja.</p>
        </div>

        <div className="space-y-6">
           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <i className="fa-solid fa-car text-blue-600"></i> BERIS-CAR (MOBIL)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {carDrivers.map(d => (
                  <button key={d.id} onClick={() => { setActiveDriverId(d.id); if (!d.isOnline) toggleDriverStatus(d.id); }} className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 transition-all text-left group active:scale-95">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <i className="fa-solid fa-user-tie"></i>
                       </div>
                       <div><p className="font-bold text-slate-900">{d.name}</p><p className="text-xs text-slate-400 font-bold uppercase">{d.vehiclePlate}</p></div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-colors"></i>
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <i className="fa-solid fa-motorcycle text-emerald-500"></i> BERIS-X (MOTOR)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {motorDrivers.map(d => (
                  <button key={d.id} onClick={() => { setActiveDriverId(d.id); if (!d.isOnline) toggleDriverStatus(d.id); }} className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 transition-all text-left group active:scale-95">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <i className="fa-solid fa-motorcycle"></i>
                       </div>
                       <div><p className="font-bold text-slate-900">{d.name}</p><p className="text-xs text-slate-400 font-bold uppercase">{d.vehiclePlate}</p></div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-200 group-hover:text-emerald-500 transition-colors"></i>
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl flex gap-3 items-center">
           <i className="fa-solid fa-circle-info text-slate-400"></i>
           <p className="text-[10px] text-slate-500 font-medium text-center">Aplikasi siap instal sebagai APK. Gunakan tombol "Selesai Shift" saat bergantian HP.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleCapturePhoto} 
      />

      {/* Header Profile Driver */}
      <div className={`${isCar ? 'bg-slate-900' : 'bg-emerald-950'} text-white rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors duration-500`}>
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${themeColor}`}>
                   <i className={`fa-solid ${isCar ? 'fa-user-tie' : 'fa-motorcycle'}`}></i>
                </div>
                <div>
                   <h2 className="font-black italic text-lg tracking-tighter">{activeDriver.name}</h2>
                   <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{activeDriver.vehiclePlate}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black transition-all border ${activeDriver.isOnline ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-600 text-slate-300 border-slate-500'}`}>
                  {activeDriver.isOnline ? '● ONLINE' : '● OFFLINE'}
              </span>
            </div>
            </div>

            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">Poin Hari Ini</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-extrabold">Rp {(totalTodayEarnings / 1000).toFixed(0)}K</h2>
                        <span className="text-green-400 text-xs font-bold">({driverTodayCompleted.length} Trip)</span>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">Biaya</p>
                    <h2 className="text-xl font-bold text-red-400 italic">Rp {(totalTodayExpenses / 1000).toFixed(0)}K</h2>
                </div>
            </div>
        </div>
        <div className="absolute top-[-20px] right-[-20px] opacity-10"><i className={`fa-solid ${isCar ? 'fa-car' : 'fa-motorcycle'} text-9xl`}></i></div>
      </div>

      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'orders' ? `bg-white ${themeText} shadow-md scale-100` : 'text-slate-500'}`}><i className="fa-solid fa-route mr-2 text-sm"></i> Order</button>
        <button onClick={() => setActiveTab('kas')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'kas' ? `bg-white ${themeText} shadow-md scale-100` : 'text-slate-500'}`}><i className="fa-solid fa-book-open mr-2 text-sm"></i> Kas</button>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4 px-1">
          {currentOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-3xl"><i className="fa-solid fa-mug-hot"></i></div>
              <h4 className="font-bold text-slate-800 mb-1">Standby, Kang {activeDriver.name.split(' ')[0]}!</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Belum ada tugas. Sambil nunggu, cek kondisi armada ya.</p>
            </div>
          ) : (
            currentOrders.map(order => (
              <Card key={order.id} className={`border-l-8 ${isCar ? 'border-l-blue-600' : 'border-l-emerald-600'} rounded-[1.5rem] shadow-lg animate-in slide-in-from-bottom-4 duration-300 p-6`}>
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-xl text-slate-900 tracking-tight">{order.customerName}</h4>
                      {order.isSubscription && <SubscriptionBadge />}
                    </div>
                    <a href={`tel:${order.customerPhone}`} className={`text-sm font-bold flex items-center gap-1 ${themeText}`}><i className="fa-solid fa-phone-volume"></i> {order.customerPhone}</a>
                  </div>
                  <Badge status={order.status} />
                </div>

                <div className="space-y-5 mb-6 relative">
                  <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-100"></div>
                  <div className="flex gap-4 relative z-10"><div className="w-5 h-5 rounded-full bg-red-500 border-4 border-white shadow-sm shrink-0 mt-0.5"></div><div className="flex-1 text-xs"><p className="text-slate-400 font-black uppercase tracking-widest mb-1">Jemput</p><p className="text-slate-900 font-bold leading-tight">{order.pickupLocation}</p></div></div>
                  <div className="flex gap-4 relative z-10"><div className="w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm shrink-0 mt-0.5"></div><div className="flex-1 text-xs"><p className="text-slate-400 font-black uppercase tracking-widest mb-1">Tujuan</p><p className="text-slate-900 font-bold leading-tight">{order.destinationLocation}</p></div></div>
                </div>

                {order.status === OrderStatus.ON_TRIP && (
                  <div className="mb-6">
                    {tempProofImage ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 animate-in zoom-in duration-300">
                        <img src={tempProofImage} alt="Proof" className="w-full h-48 object-cover" />
                        <button 
                          onClick={() => setTempProofImage(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-green-500 text-white text-[10px] font-black text-center py-1 uppercase">✓ Foto Bukti Siap</div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-slate-50"
                      >
                        <i className="fa-solid fa-camera text-3xl"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ambil Foto Bukti (Wajib)</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleUpdateStatus(order.id, order.status)}
                    className={`w-full py-5 ${themeColor} text-white rounded-[1.2rem] font-black text-base shadow-xl shadow-blue-200 hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3`}
                  >
                    {order.status === OrderStatus.ASSIGNED && <><i className="fa-solid fa-flag"></i> Ambil Order</>}
                    {order.status === OrderStatus.PICKING_UP && <><i className="fa-solid fa-user-check"></i> Sudah Jemput</>}
                    {order.status === OrderStatus.ON_TRIP && <><i className="fa-solid fa-circle-check"></i> Selesai & Kirim Foto</>}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => generateWhatsAppMessage(order.id)} disabled={isAIGenerating === order.id} className="py-4 bg-green-50 text-green-700 rounded-2xl font-black text-xs hover:bg-green-100 transition-colors flex items-center justify-center gap-2 uppercase tracking-tighter">
                          <i className={`fa-brands fa-whatsapp text-lg ${isAIGenerating === order.id ? 'animate-bounce' : ''}`}></i> {isAIGenerating === order.id ? 'Loading...' : 'Pesan AI'}
                      </button>
                      <button onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`, '_blank')} className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-tighter">
                          <i className="fa-solid fa-comment text-lg"></i> WA
                      </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300 px-1">
          <div className="flex justify-between items-center px-1"><h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Biaya Hari Ini</h3><button onClick={() => setShowExpenseModal(true)} className={`${isCar ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} px-4 py-2 rounded-xl text-[10px] font-black border hover:opacity-80 transition-colors`}>+ Tambah Biaya</button></div>
          <div className="space-y-3">
            {driverTodayExpenses.length === 0 ? <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Belum ada biaya</p></div> :
              driverTodayExpenses.map(expense => (
                <div key={expense.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-sm"><i className={`fa-solid ${expense.category === ExpenseCategory.FUEL ? 'fa-gas-pump' : expense.category === ExpenseCategory.PARKING ? 'fa-square-p' : 'fa-receipt'}`}></i></div><div><p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{expense.category}</p><p className="text-[10px] text-slate-500 font-bold italic">{expense.note || '-'}</p></div></div>
                  <p className="text-sm font-black text-red-600 italic">- Rp {expense.amount.toLocaleString('id-ID')}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <div className="px-1 pt-6 pb-4">
         <button onClick={() => { if(confirm("Yakin mau selesai shift?")) setActiveDriverId(null); }} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2 group">
            <i className="fa-solid fa-right-from-bracket group-hover:rotate-180 transition-transform duration-500"></i> Selesai Shift / Ganti Akun
         </button>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xs p-8 shadow-2xl animate-in zoom-in duration-300">
             <div className="text-center mb-6"><div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"><i className="fa-solid fa-gas-pump"></i></div><h2 className="text-xl font-black italic tracking-tighter mb-1 uppercase">Catat Biaya ⛽</h2></div>
             <form onSubmit={handleAddExpense} className="space-y-5">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none font-bold" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}>
                    {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah (Rp)</label>
                  <input type="number" required autoFocus className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-2xl focus:ring-2 focus:ring-red-500 focus:outline-none font-black text-red-600" placeholder="10000" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseInt(e.target.value) || 0})} />
                </div>
                <div className="pt-2 flex gap-3"><button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-4 text-sm font-black text-slate-300 uppercase tracking-widest">Batal</button><button type="submit" className="flex-2 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest px-8 py-4">Simpan</button></div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
