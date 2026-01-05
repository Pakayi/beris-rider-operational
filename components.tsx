
import React from 'react';
import { OrderStatus, VehicleType, Driver } from './types';

export const Badge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.UNVERIFIED]: 'bg-slate-100 text-slate-600 border-slate-200 border-dashed',
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [OrderStatus.ASSIGNED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [OrderStatus.PICKING_UP]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    [OrderStatus.ON_TRIP]: 'bg-purple-100 text-purple-800 border-purple-200',
    [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const SubscriptionBadge: React.FC = () => (
  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1 text-[9px] font-black uppercase border border-amber-200">
    <i className="fa-solid fa-calendar-check"></i> Langganan
  </span>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${className}`}>
    {children}
  </div>
);

export const VehicleIcon: React.FC<{ type: VehicleType; className?: string }> = ({ type, className }) => {
  return type === VehicleType.CAR ? 
    <i className={`fa-solid fa-car text-blue-600 ${className}`}></i> : 
    <i className={`fa-solid fa-motorcycle text-emerald-500 ${className}`}></i>;
};

export const VehicleBadge: React.FC<{ type: VehicleType }> = ({ type }) => {
  const isCar = type === VehicleType.CAR;
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
      isCar 
        ? 'bg-blue-50 text-blue-700 border-blue-200' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }`}>
      {isCar ? 'Beris-Car' : 'Beris-X'}
    </span>
  );
};

export const TrustCard: React.FC<{ driver: Driver; onClose: () => void }> = ({ driver, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
    <div className="bg-white rounded-[2rem] w-full max-w-xs overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-4 border-blue-600">
      <div className="bg-blue-600 p-6 text-center text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-blue-400 flex items-center justify-center text-blue-600 overflow-hidden shadow-inner">
           <i className="fa-solid fa-user-tie text-5xl mt-2"></i>
        </div>
        <h3 className="text-xl font-black italic tracking-tighter">DRIVER TERVERIFIKASI</h3>
        <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">Beris Rider Tasikmalaya</p>
      </div>
      
      <div className="p-8 text-center space-y-4">
        <div>
          <h4 className="text-2xl font-black text-slate-900">{driver.name}</h4>
          <div className="flex justify-center gap-1 text-yellow-400 mt-1">
            {[1, 2, 3, 4, 5].map(s => <i key={s} className="fa-solid fa-star text-xs"></i>)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Armada</p>
            <p className="text-sm font-black text-slate-800">{driver.vehicleType === VehicleType.MOTORCYCLE ? 'Beris-X' : 'Beris-Car'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Plat Nomor</p>
            <p className="text-sm font-black text-slate-800">{driver.vehiclePlate}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm bg-green-50 py-2 rounded-xl">
          <i className="fa-solid fa-shield-halved"></i>
          <span>Jaminan Aman & Sopan</span>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Tutup Profil
        </button>
      </div>
      
      <div className="bg-slate-100 py-3 text-center">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Partner Resmi Beris Rider</p>
      </div>
    </div>
  </div>
);
