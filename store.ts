import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Order, Driver, OrderStatus, VehicleType, Expense } from "./types";

const INITIAL_DRIVERS: Driver[] = [
  { id: "d1", name: "Asep Saepul", phone: "08123456789", vehicleType: VehicleType.CAR, vehiclePlate: "Z 1234 AB", isOnline: true },
  { id: "d2", name: "Dadang Keren", phone: "08198765432", vehicleType: VehicleType.CAR, vehiclePlate: "Z 5678 CD", isOnline: true },
  { id: "r1", name: "Ujang Racing", phone: "08556677889", vehicleType: VehicleType.MOTORCYCLE, vehiclePlate: "Z 9900 EF", isOnline: true },
];

export const useBerisStore = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Orders secara Real-time
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      );
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Drivers secara Real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "drivers"), (snapshot) => {
      if (snapshot.empty) {
        // Inisialisasi driver jika masih kosong di Firestore
        INITIAL_DRIVERS.forEach((d) => {
          setDoc(doc(db, "drivers", d.id), d);
        });
      } else {
        const driversData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Driver));
        setDrivers(driversData);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Expenses secara Real-time
  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(expensesData);
    });
    return () => unsubscribe();
  }, []);

  const addOrder = async (newOrderData: Omit<Order, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "orders"), {
        ...newOrderData,
        createdAt: Date.now(),
        status: newOrderData.status || OrderStatus.UNVERIFIED,
      });
    } catch (e) {
      console.error("Error adding order: ", e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, driverId?: string, proofImage?: string) => {
    const orderRef = doc(db, "orders", orderId);
    const updateData: any = { status };
    if (driverId) updateData.driverId = driverId;
    if (proofImage) updateData.proofImage = proofImage;

    await updateDoc(orderRef, updateData);

    if (driverId) {
      const driverRef = doc(db, "drivers", driverId);
      await updateDoc(driverRef, {
        currentOrderId: status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED ? null : orderId,
      });
    }
  };

  const assignDriver = (orderId: string, driverId: string) => {
    updateOrderStatus(orderId, OrderStatus.ASSIGNED, driverId);
  };

  const toggleDriverStatus = async (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      await updateDoc(doc(db, "drivers", driverId), { isOnline: !driver.isOnline });
    }
  };

  const addExpense = async (expenseData: Omit<Expense, "id" | "createdAt">) => {
    await addDoc(collection(db, "expenses"), {
      ...expenseData,
      createdAt: Date.now(),
    });
  };

  const getStats = () => {
    const completed = orders.filter((o) => o.status === OrderStatus.COMPLETED);
    const revenue = completed.reduce((acc, curr) => acc + curr.price, 0);
    const active = orders.filter((o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length;
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = revenue - totalExpenses;

    const driverStats = drivers.map((d) => {
      const dOrders = completed.filter((o) => o.driverId === d.id);
      const dExpenses = expenses.filter((e) => e.driverId === d.id);
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
      driverStats,
    };
  };

  return {
    orders,
    drivers,
    expenses,
    loading,
    addOrder,
    updateOrderStatus,
    assignDriver,
    toggleDriverStatus,
    addExpense,
    getStats,
  };
};
