
export enum OrderStatus {
  UNVERIFIED = 'UNVERIFIED', 
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKING_UP = 'PICKING_UP',
  ON_TRIP = 'ON_TRIP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR'
}

export enum ExpenseCategory {
  FUEL = 'BBM',
  PARKING = 'Parkir',
  MAINTENANCE = 'Servis/Ban',
  OTHER = 'Lain-lain'
}

export interface Expense {
  id: string;
  driverId: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
  createdAt: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  isOnline: boolean;
  currentOrderId?: string;
  rating?: number;
  tripsCount?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  destinationLocation: string;
  status: OrderStatus;
  driverId?: string;
  price: number;
  vehicleType: VehicleType;
  createdAt: number;
  notes?: string;
  proofImage?: string; // Base64 proof of delivery
  // Subscription fields
  isSubscription?: boolean;
  subscriptionDays?: string[];
}

export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  revenue: number;
  totalExpenses: number;
  netProfit: number;
}
