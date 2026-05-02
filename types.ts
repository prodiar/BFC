
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  savedAddresses: string[];
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  role: UserRole;
  loyaltyPoints: number;
  tier: 'ELITE' | 'GOLD' | 'SILVER' | 'BRONZE';
  createdAt: string;
  socialProvider?: 'GOOGLE' | 'PHONE';
  password?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  isPopular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  qty: number;
}

export type PaymentMethod = 'BKASH' | 'NAGAD' | 'ROCKET' | 'VISA' | 'MASTER' | 'COD';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  createdAt: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  trackingHistory: { status: OrderStatus; time: string }[];
}

export type ViewState = 'HOME' | 'MENU' | 'CART' | 'CHECKOUT' | 'PAYMENT' | 'RECEIPT' | 'ADMIN' | 'LOGIN' | 'SIGNUP' | 'PROFILE' | 'TRACK_ORDERS' | 'GATEWAY';

export interface Analytics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDay: { date: string, amount: number }[];
  paymentMix: Record<string, number>;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}

export interface MenuUpdate {
  type: 'PRICE_CHANGE' | 'AVAILABILITY' | 'ADD' | 'DELETE';
  itemName: string;
  details: string;
  timestamp: Date;
}

export type LayoutPreset = 'BFC_CLASSIC' | 'ELITE_DARK' | 'MINIMAL_WHITE';

export interface ThemeConfig {
  bg: string;
  fg: string;
  primary: string;
  accent: string;
  card: string;
  border: string;
  font: string;
  shadow: string;
}

export interface AIInsight {
  peakHour: string;
  trendingDish: string;
  recommendation: string;
}
