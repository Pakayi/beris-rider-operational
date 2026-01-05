import React, { useState, useEffect, useRef } from "react";
import { useBerisStore } from "./store";
import { Card, Badge, SubscriptionBadge, VehicleBadge } from "./components";
import { OrderStatus, Order, VehicleType } from "./types";
import { suggestOperationalStrategy } from "./GeminiService";

const AdminView: React.FC = () => {
  const { orders, drivers, assignDriver, addDriver, deleteDriver } = useBerisStore();
  const [activeTab, setActiveTab] = useState<"orders" | "drivers">("orders");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    vehicleType: VehicleType.MOTORCYCLE,
    vehiclePlate: "",
  });

  const prevOrdersCount = useRef(orders.length);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      const latestOrder = orders[0];
      if (latestOrder.status === OrderStatus.UNVERIFIED) {
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch((e) => console.log("Audio play blocked", e));
        }
      }
    }
    prevOrdersCount.current = orders.length;
  }, [orders, soundEnabled]);

  const generateAITip = async () => {
    setIsAnalyzing(true);
    const tip = await suggestOperationalStrategy(orders);
    setAiAnalysis(tip);
    setIsAnalyzing(false);
  };

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDriver(newDriver);
    setNewDriver({ name: "", phone: "", vehicleType: VehicleType.MOTORCYCLE, vehiclePlate: "" });
    setShowAddDriver(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">OPERASIONAL 🛰️</h1>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === "orders" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
            >
              Order Aktif
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === "drivers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
            >
              Kelola Driver
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${soundEnabled ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-400"}`}>
            <i className={`fa-solid ${soundEnabled ? "fa-bell" : "fa-bell-slash"}`}></i>
          </button>
          <button onClick={generateAITip} disabled={isAnalyzing} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 flex items-center gap-2">
            <i className={`fa-solid fa-wand-magic-sparkles ${isAnalyzing ? "animate-spin" : ""}`}></i> {isAnalyzing ? "..." : "Tips AI"}
          </button>
        </div>
      </div>

      {activeTab === "orders" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {orders.filter((o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-xs">Belum ada order masuk</p>
              </div>
            ) : (
              orders
                .filter((o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED)
                .map((order) => (
                  <Card key={order.id} className="hover:shadow-xl transition-all rounded-[1.5rem] border-slate-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">{order.customerName.charAt(0)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{order.customerName}</h4>
                            {order.isSubscription && <SubscriptionBadge />}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#ID-{order.id.substring(0, 5)}</p>
                        </div>
                      </div>
                      <Badge status={order.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl mb-4 text-xs font-bold text-slate-600">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-red-500 mb-0.5">Penjemputan</p>
                        {order.pickupLocation}
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-blue-500 mb-0.5">Tujuan</p>
                        {order.destinationLocation}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900 italic">Rp {order.price.toLocaleString("id-ID")}</span>
                        <VehicleBadge type={order.vehicleType} />
                      </div>
                      <div>
                        {order.status === OrderStatus.UNVERIFIED || order.status === OrderStatus.PENDING ? (
                          <select
                            className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl px-4 py-2 focus:outline-none shadow-lg shadow-blue-100"
                            onChange={(e) => assignDriver(order.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Pilih Driver
                            </option>
                            {drivers
                              .filter((d) => d.isOnline && !d.currentOrderId && d.vehicleType === order.vehicleType)
                              .map((d) => (
                                <option key={d.id} value={d.id} className="text-slate-900">
                                  {d.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-blue-600 italic">Driver: {drivers.find((d) => d.id === order.driverId)?.name || "N/A"}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
          <div className="space-y-6">
            <Card className="bg-slate-900 border-none text-white p-6 shadow-2xl rounded-[2rem]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-white/40 italic">Monitor Armada</h3>
              <div className="space-y-5">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${driver.isOnline ? "bg-green-500" : "bg-slate-700"}`}></div>
                      <p className="text-sm font-bold text-white leading-none">{driver.name}</p>
                    </div>
                    <div className={`text-[8px] font-black uppercase ${driver.currentOrderId ? "text-orange-400" : "text-green-400"}`}>{driver.currentOrderId ? "Sibuk" : "Standby"}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Database Driver</h3>
            <button onClick={() => setShowAddDriver(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
              + Daftar Driver
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((d) => (
              <Card key={d.id} className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${d.vehicleType === VehicleType.CAR ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                    <i className={`fa-solid ${d.vehicleType === VehicleType.CAR ? "fa-car" : "fa-motorcycle"}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{d.vehiclePlate}</p>
                  </div>
                </div>
                <button onClick={() => deleteDriver(d.id)} className="text-red-300 hover:text-red-500 transition-colors p-2">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showAddDriver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-xl font-black italic tracking-tighter mb-6 uppercase text-slate-900">Pendaftaran Driver 🏁</h2>
            <form onSubmit={handleRegisterDriver} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="Contoh: Asep Saepul"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Armada</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDriver({ ...newDriver, vehicleType: VehicleType.MOTORCYCLE })}
                    className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${
                      newDriver.vehicleType === VehicleType.MOTORCYCLE ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 text-slate-400"
                    }`}
                  >
                    Beris-X (Motor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDriver({ ...newDriver, vehicleType: VehicleType.CAR })}
                    className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${newDriver.vehicleType === VehicleType.CAR ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 text-slate-400"}`}
                  >
                    Beris-Car (Mobil)
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plat Nomor</label>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none uppercase"
                  value={newDriver.vehiclePlate}
                  onChange={(e) => setNewDriver({ ...newDriver, vehiclePlate: e.target.value.toUpperCase() })}
                  placeholder="Z 1234 ABC"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddDriver(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase">
                  Batal
                </button>
                <button type="submit" className="flex-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest px-8 py-3 shadow-lg shadow-blue-100">
                  Simpan Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
