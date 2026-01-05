import React, { useState, useEffect, useRef } from "react";
import { useBerisStore } from "./store";
import { Card, Badge, SubscriptionBadge, VehicleBadge } from "./components";
import { OrderStatus, Order } from "./types";
import { suggestOperationalStrategy } from "./GeminiService";

const AdminView: React.FC = () => {
  const { orders, drivers, assignDriver } = useBerisStore();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tight">OPERASIONAL 🛰️</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tasikmalaya Control Center</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Map Monitoring */}
          <div className="bg-slate-200 rounded-[2rem] h-80 overflow-hidden relative shadow-inner border-2 border-slate-100">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31671.93481282902!2d108.20455798939634!3d-7.334053351336021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6154131b3e82ef%3A0x6b1f2389d7146e10!2sTasikmalaya%2C%20Tasikmalaya%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
              allowFullScreen
            ></iframe>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Area Monitoring</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
              <i className="fa-solid fa-route text-blue-600"></i> Order Aktif
            </h3>
            {orders
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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#ID-{order.id}</p>
                      </div>
                    </div>
                    <Badge status={order.status} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl mb-4 text-xs font-bold text-slate-600">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-red-500 mb-0.5">Penjemputan</p>
                      <i className="fa-solid fa-location-dot mr-2"></i> {order.pickupLocation}
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-blue-500 mb-0.5">Tujuan</p>
                      <i className="fa-solid fa-flag-checkered mr-2"></i> {order.destinationLocation}
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
                            Tugaskan Driver
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
                        <span className="text-[10px] font-black uppercase text-blue-600 italic">Driver: {drivers.find((d) => d.id === order.driverId)?.name}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-none text-white p-6 shadow-2xl rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-white/40 italic">Monitoring Armada</h3>
              <div className="space-y-5">
                {drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${driver.isOnline ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "bg-slate-700"}`}></div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{driver.name}</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">{driver.vehiclePlate}</p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        driver.currentOrderId ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}
                    >
                      {driver.currentOrderId ? "Sibuk" : "Standby"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <i className="fa-solid fa-radar absolute -bottom-6 -right-6 text-9xl text-white/5"></i>
          </Card>

          <Card className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Analisis AI Operasional</h3>
            <div className="text-xs font-bold text-slate-600 leading-relaxed italic">{aiAnalysis || "Belum ada analisis. Klik Tips AI untuk memulai."}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
