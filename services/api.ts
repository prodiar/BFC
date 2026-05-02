import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';
import { MenuItem, Order, OrderStatus, AuditLog, User, UserRole, Analytics } from '../types';
import { MOCK_MENU } from '../constants';

export const API = {
  async signup(data: Partial<User>): Promise<User> {
    const email = data.email || `${data.phone}@bfc-elite.com`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, data.password || 'bfc1234');
    const firebaseUser = userCredential.user;

    const newUser: User = {
      id: firebaseUser.uid,
      name: data.name || '',
      username: data.username || `user_${Date.now()}`,
      email: data.email || email,
      phone: data.phone || '',
      address: data.address || '',
      savedAddresses: data.address ? [data.address] : [],
      role: (data.email === 'razuanowar@gmail.com' || email === 'razuanowar@gmail.com') ? UserRole.ADMIN : UserRole.CUSTOMER,
      loyaltyPoints: 0,
      tier: 'BRONZE',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    return newUser;
  },

  async login(phone: string, password?: string): Promise<User | null> {
    // In a real app, we'd use phone auth or query user by phone first
    // For this simple migration, we'll try to find user by phone in firestore first
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const userData = querySnapshot.docs[0].data() as User;
    const email = userData.email || `${phone}@bfc-elite.com`;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password || 'bfc1234');
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  },

  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    // Note: This needs to be handled via a state listener in the app
    return null; 
  },

  async getProfile(uid: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? (docSnap.data() as User) : null;
  },

  logout() {
    return signOut(auth);
  },

  async getMenu(): Promise<MenuItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'menu'));
      if (querySnapshot.empty) {
        // Seed menu if empty
        const promises = MOCK_MENU.map(item => setDoc(doc(db, 'menu', item.id), item));
        // We use allSettled to avoid blocking if some fail (e.g. permission)
        await Promise.allSettled(promises);
        return MOCK_MENU;
      }
      return querySnapshot.docs.map(doc => doc.data() as MenuItem);
    } catch (error) {
      console.error("Error fetching menu:", error);
      return MOCK_MENU; // Fallback to mock
    }
  },

  async updateMenuItem(item: MenuItem, userName: string) {
    try {
      await setDoc(doc(db, 'menu', item.id), item);
      await this.addLog('STOCK_UPDATE', userName, `Updated ${item.name} status`);
    } catch (e) {
      console.error("Error updating menu item:", e);
    }
  },

  async getOrders(user?: User | null): Promise<Order[]> {
    if (!user) return [];
    
    let q;
    if (user.role === UserRole.ADMIN) {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'orders'), 
        where('customerId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
    }
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...(doc.data() as object), id: doc.id } as Order));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  async placeOrder(order: Order) {
    const orderData = { ...order };
    delete (orderData as any).id;
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    order.id = docRef.id;
    if (order.customerName) {
      await this.addLog('PAYMENT_LOG', order.customerName, `Verified ${order.paymentMethod} transaction`);
    }
    return order;
  },

  async updateOrderStatus(id: string, status: OrderStatus, userName: string) {
    const orderRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      const order = orderSnap.data() as Order;
      await updateDoc(orderRef, {
        status,
        trackingHistory: [...order.trackingHistory, { status, time: new Date().toISOString() }]
      });
      await this.addLog('STATUS_SHIFT', userName, `Order ${id} marked as ${status}`);
    }
  },

  async getAnalytics(): Promise<Analytics> {
    const user = auth.currentUser;
    if (!user) {
      return { totalSales: 0, totalOrders: 0, averageOrderValue: 0, salesByDay: [], paymentMix: {} };
    }
    
    // Explicitly need admin check for analytics usually
    const orders = await this.getOrders({ id: user.uid, role: UserRole.ADMIN } as User); 
    const valid = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const totalSales = valid.reduce((a, b) => a + b.total, 0);
    
    const salesByDay = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const amt = valid.filter(o => o.createdAt.startsWith(str)).reduce((a, b) => a + b.total, 0);
      return { date: str, amount: amt };
    }).reverse();

    const paymentMix: Record<string, number> = {};
    valid.forEach(o => {
      paymentMix[o.paymentMethod] = (paymentMix[o.paymentMethod] || 0) + 1;
    });

    return {
      totalSales,
      totalOrders: orders.length,
      averageOrderValue: orders.length ? totalSales / orders.length : 0,
      salesByDay,
      paymentMix
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as AuditLog);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  },

  async addLog(action: string, userName: string, details: string) {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        user: userName,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error logging activity:", e);
    }
  },

  subscribe(user: User | null, cb: (type: string) => void) {
    const unsubs: (() => void)[] = [];
    
    // Always listen to menu
    unsubs.push(onSnapshot(collection(db, 'menu'), () => cb('SYNC')));
    
    // Only listen to orders if signed in
    if (user) {
      let q;
      if (user.role === UserRole.ADMIN) {
        q = query(collection(db, 'orders'));
      } else {
        q = query(collection(db, 'orders'), where('customerId', '==', user.id));
      }
      unsubs.push(onSnapshot(q, () => cb('SYNC'), (err) => {
        console.error("Order snapshot error:", err);
      }));
    }
    
    return () => unsubs.forEach(u => u());
  },

  onAuthStateChanged(cb: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await this.getProfile(firebaseUser.uid);
        cb(profile);
      } else {
        cb(null);
      }
    });
  }
};
