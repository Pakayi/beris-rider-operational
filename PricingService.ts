
import { VehicleType } from './types';

export const LANDMARKS = [
  "Asia Plaza",
  "Dadaha (Kompleks Olahraga)",
  "Unsil (Univ. Siliwangi)",
  "Stasiun Tasikmalaya",
  "Masjid Agung Tasikmalaya",
  "Terminal Indihiang",
  "Mayasari Plaza",
  "RSUD dr. Soekardjo",
  "Yogya HZ Mustofa"
];

// Map harga flat antar zona landmark (Sederhana: Motor 10rb, Mobil 25rb untuk rute populer)
// Di versi lanjut, ini bisa jadi matrix harga yang lebih detail.
export const calculatePrice = (pickup: string, destination: string, vehicle: VehicleType): number => {
  if (!pickup.trim() || !destination.trim()) return 0;
  
  const isPickupLandmark = LANDMARKS.includes(pickup);
  const isDestLandmark = LANDMARKS.includes(destination);

  // Jika rute antar Landmark, berikan harga Flat Promo
  if (isPickupLandmark && isDestLandmark) {
    return vehicle === VehicleType.MOTORCYCLE ? 10000 : 25000;
  }

  // Jika tidak, gunakan logika estimasi jarak (fallback)
  const baseFare = vehicle === VehicleType.MOTORCYCLE ? 8000 : 20000;
  const perKmFare = vehicle === VehicleType.MOTORCYCLE ? 2500 : 5000;
  
  const combinedLength = pickup.length + destination.length;
  const diffFactor = Math.abs(pickup.length - destination.length);
  const estimatedKm = 1 + (combinedLength % 4) + (diffFactor % 5);
  
  let total = baseFare;
  if (estimatedKm > 2) {
    total += (estimatedKm - 2) * perKmFare;
  }
  
  return Math.round(total / 500) * 500;
};

export const getTarifDescription = (vehicle: VehicleType): string => {
  return vehicle === VehicleType.MOTORCYCLE 
    ? "Mulai dari Rp 8.000 (Flat Landmark 10rb)" 
    : "Mulai dari Rp 20.000 (Flat Landmark 25rb)";
};
