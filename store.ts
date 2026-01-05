
import { useState, useEffect } from 'react';
import { Order, Driver, OrderStatus, VehicleType, Expense } from './types';

const STORAGE_KEY_ORDERS = 'beris_orders_v1';
const STORAGE_KEY_DRIVERS = 'beris_drivers_v1';
const STORAGE_KEY_EXPENSES = 'beris_expenses_v1';

const INITIAL_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Asep Saepul', phone: '08123456789', vehicleType: VehicleType.CAR, vehiclePlate: 'Z 1234 AB', isOnline: true },
  { id: 'd2', name: 'Dadang Keren', phone: '08198765432', vehicleType: VehicleType.CAR, vehiclePlate: 'Z 5678 CD', isOnline: true },
  { id: 'r1', name: 'Ujang Racing', phone: '08556677889', vehicleType: VehicleType.MOTORCYCLE, vehiclePlate: 'Z 9900 EF', isOnline: true },
];

export const useBerisStore = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DRIVERS);
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  const addOrder = (newOrderData: Omit<Order, 'id' | 'createdAt'>) => {
    const order: Order = {
      ...newOrderData,
      id: `BR-${Date.now().toString().slice(-6)}`,
      createdAt: Date.now(),
      status: newOrderData.status || OrderStatus.PENDING,
    };
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, driverId?: string, proofImage?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status, 
          driverId: driverId || o.driverId,
          proofImage: proofImage || o.proofImage 
        };
      }
      return o;
    }));

    if (driverId) {
       setDrivers(prev => prev.map(d => {
         if (d.id === driverId) {
            return { ...d, currentOrderId: status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED ? undefined : orderId };
         }
         return d;
       }));
    }
  };

  const assignDriver = (orderId: string, driverId: string) => {
    updateOrderStatus(orderId, OrderStatus.ASSIGNED, driverId);
  };

  const toggleDriverStatus = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, isOnline: !d.isOnline } : d));
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...expenseData,
      id: `EXP-${Date.now().toString().slice(-6)}`,
      createdAt: Date.now(),
    };
    setExpenses(prev => [expense, ...prev]);
  };

  const getStats = () => {
    const completed = orders.filter(o => o.status === OrderStatus.COMPLETED);
    const revenue = completed.reduce((acc, curr) => acc + curr.price, 0);
    const active = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length;
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = revenue - totalExpenses;
    
    const driverStats = drivers.map(d => {
      const dOrders = completed.filter(o => o.driverId === d.id);
      const dExpenses = expenses.filter(e => e.driverId === d.id);
      return {
        ...d,
        completedCount: dOrders.length,
        totalEarnings: dOrders.reduce((acc, curr) => acc + curr.price, 0),
        totalExpenses: dExpenses.reduce((acc, curr) => acc + curr.amount, 0),
      };
    });

    return { 
      total: orders.length, 
      completed: completed.length, 
      revenue, 
      active, 
      totalExpenses, 
      netProfit, 
      driverStats 
    };
  };

  return { 
    orders, 
    drivers, 
    expenses,
    addOrder, 
    updateOrderStatus, 
    assignDriver, 
    toggleDriverStatus, 
    addExpense,
    getStats 
  };
};
