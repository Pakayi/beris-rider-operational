import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Order, Driver, OrderStatus, Expense, VehicleType } from "./types";

export const useBerisStore = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Orders Error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        const driversData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Driver));
        setDrivers(driversData);
      },
      (error) => console.error("Firestore Drivers Error:", error)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expensesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
        setExpenses(expensesData);
      },
      (error) => console.error("Firestore Expenses Error:", error)
    );
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
      console.error("Error adding order:", e);
    }
  };

  const addDriver = async (driverData: { name: string; phone: string; vehicleType: VehicleType; vehiclePlate: string }) => {
    try {
      await addDoc(collection(db, "drivers"), {
        ...driverData,
        isOnline: false,
        tripsCount: 0,
      });
    } catch (e) {
      console.error("Error adding driver:", e);
      alert("Gagal daftar driver. Cek koneksi.");
    }
  };

  const deleteDriver = async (driverId: string) => {
    if (!confirm("Hapus driver ini dari database?")) return;
    try {
      await deleteDoc(doc(db, "drivers", driverId));
    } catch (e) {
      console.error("Error deleting driver:", e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, driverId?: string, proofImage?: string) => {
    try {
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
    } catch (e) {
      console.error("Update status error:", e);
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
    await addDoc(collection(db, "expenses"), { ...expenseData, createdAt: Date.now() });
  };

  const getStats = () => {
    const completed = orders.filter((o) => o.status === OrderStatus.COMPLETED);
    const revenue = completed.reduce((acc, curr) => acc + curr.price, 0);
    const active = orders.filter((o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length;
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

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
      netProfit: revenue - totalExpenses,
      driverStats,
    };
  };

  return { orders, drivers, expenses, loading, addOrder, addDriver, deleteDriver, updateOrderStatus, assignDriver, toggleDriverStatus, addExpense, getStats };
};
