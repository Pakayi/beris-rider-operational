import React, { useState, useEffect } from "react";
import { useBerisStore } from "./store";
import { VehicleType, OrderStatus } from "./types";
import { Card } from "./components";
import { calculatePrice } from "./PricingService";
import { searchLocationWithAI } from "./GeminiService";

const CustomerView: React.FC = () => {
  const { addOrder } = useBerisStore();
  const [submitted, setSubmitted] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [isSearching, setIsSearching] = useState<"pickup" | "dest" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    pickupLocation: "",
    destinationLocation: "",
    vehicleType: VehicleType.MOTORCYCLE,
    notes: "",
  });

  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    const price = calculatePrice(formData.pickupLocation, formData.destinationLocation, formData.vehicleType);
    setEstimatedPrice(price);
  }, [formData.pickupLocation, formData.destinationLocation, formData.vehicleType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      ...formData,
      status: OrderStatus.UNVERIFIED,
      price: estimatedPrice,
      isSubscription: isSubscription,
    });
    setSubmitted(true);
  };

  const handleAISearch = async (field: "pickup" | "dest") => {
    if (!searchQuery.trim()) return;
    setIsSearching(field);
    const result = await searchLocationWithAI(searchQuery);
    if (result) {
      if (field === "pickup") {
        setFormData({ ...formData, pickupLocation: result.name });
      } else {
        setFormData({ ...formData, destinationLocation: result.name });
      }
      setSearchQuery("");
    } else {
      alert("Lokasi tidak ditemukan di Tasikmalaya, coba nama tempat lain ya!");
    }
    setIsSearching(null);
  };

  const getWaLink = () => {
    const baseUrl = "https://wa.me/6282128345224";
    const message = `Halo Beris Rider! 🚀%0A%0ASaya mau konfirmasi order:%0ANama: ${formData.customerName}%0AJemput: ${formData.pickupLocation}%0ATujuan: ${formData.destinationLocation}%0AArmada: ${
      formData.vehicleType === VehicleType.MOTORCYCLE ? "Motor" : "Mobil"
    }%0AEstimasi Tarif: Rp ${estimatedPrice.toLocaleString("id-ID")}%0A%0AMohon diproses ya Kang!`;
    return `${baseUrl}?text=${message}`;
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner shadow-green-200">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 italic">Order Terkirim! 🚀</h2>
        <p className="text-slate-500 mb-8 text-sm px-4 leading-relaxed font-medium">Admin Beris Rider sedang memproses pesanan Kakak. Klik tombol di bawah untuk konfirmasi otomatis via WhatsApp.</p>

        <a
          href={getWaLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
        >
          <i className="fa-brands fa-whatsapp text-2xl"></i>
          Konfirmasi WhatsApp
        </a>

        <button onClick={() => setSubmitted(false)} className="mt-8 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors">
          Buat Order Lain
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      {/* AI Smart Search Bar */}
      <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-white font-black text-sm mb-4 italic tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i> Cari Lokasi Pakai AI
          </h3>
          <div className="relative">
            <input
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white text-sm focus:bg-white/20 focus:outline-none placeholder:text-white/30 transition-all pr-24"
              placeholder="Contoh: 'Asia Plaza' atau 'RSUD Tasik'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAISearch("dest")}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <button onClick={() => handleAISearch("pickup")} disabled={!!isSearching} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-500 disabled:opacity-50">
                {isSearching === "pickup" ? "..." : "Jemput"}
              </button>
              <button onClick={() => handleAISearch("dest")} disabled={!!isSearching} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-500 disabled:opacity-50">
                {isSearching === "dest" ? "..." : "Tujuan"}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-3 font-medium italic">Gemini AI akan mencarikan koordinat alamat paling akurat.</p>
        </div>
        <i className="fa-solid fa-location-dot absolute -bottom-4 -right-4 text-9xl text-white/5 rotate-12"></i>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titik Jemput</label>
              <div className="relative group">
                <i className="fa-solid fa-circle-dot absolute left-4 top-4 text-red-500"></i>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm font-bold text-slate-800"
                  placeholder="Lokasi penjemputan..."
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titik Tujuan</label>
              <div className="relative group">
                <i className="fa-solid fa-location-arrow absolute left-4 top-4 text-blue-500"></i>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm font-bold text-slate-800"
                  placeholder="Mau kemana Kak?"
                  value={formData.destinationLocation}
                  onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, vehicleType: VehicleType.MOTORCYCLE })}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all group ${
                formData.vehicleType === VehicleType.MOTORCYCLE ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-50" : "border-slate-50 text-slate-400 hover:border-slate-100"
              }`}
            >
              <i className={`fa-solid fa-motorcycle text-2xl mb-2 transition-transform ${formData.vehicleType === VehicleType.MOTORCYCLE ? "scale-125" : ""}`}></i>
              <span className="text-[10px] font-black uppercase">Beris-X</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, vehicleType: VehicleType.CAR })}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all group ${
                formData.vehicleType === VehicleType.CAR ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-50" : "border-slate-50 text-slate-400 hover:border-slate-100"
              }`}
            >
              <i className={`fa-solid fa-car text-2xl mb-2 transition-transform ${formData.vehicleType === VehicleType.CAR ? "scale-125" : ""}`}></i>
              <span className="text-[10px] font-black uppercase">Beris-Car</span>
            </button>
          </div>

          {estimatedPrice > 0 && (
            <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center text-white shadow-xl">
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Estimasi Tarif</p>
                <p className="text-[10px] text-white/50 font-medium italic">Area Tasikmalaya</p>
              </div>
              <div className="text-2xl font-black italic">Rp {estimatedPrice.toLocaleString("id-ID")}</div>
            </div>
          )}

          <div className="space-y-3">
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-sm">
              Pesan Beris Rider
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerView;
