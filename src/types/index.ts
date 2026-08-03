export type UserRole = 'buyer' | 'seller';

export type ProductCategory =
  | 'Sách cũ'
  | 'Đồ học tập'
  | 'Điện tử nhỏ'
  | 'Đồ ký túc xá'
  | 'Handmade';

export type ProductCondition = 'Như mới' | 'Tốt' | 'Đã qua sử dụng';
export type ProductStatus = 'active' | 'sold';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type DeliveryMethod = 'meetup' | 'cod';

export type LocationPoint = {
  latitude: number;
  longitude: number;
  address: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  avatar: string;
  campus: string;
  verified: boolean;
};

export type Product = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  stock: number;
  image: string;
  location: LocationPoint;
  status: ProductStatus;
  createdAt: string;
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  shippingFee: number;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryLocation: LocationPoint;
  note: string;
  createdAt: string;
};

export type ProductInput = Omit<
  Product,
  'id' | 'sellerId' | 'status' | 'createdAt'
>;
