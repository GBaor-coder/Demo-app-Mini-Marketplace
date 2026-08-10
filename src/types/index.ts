export type UserRole = 'buyer' | 'seller';

export type ProductCategory =
  | 'Giáo trình'
  | 'Đồ điện tử'
  | 'Đồ dùng học tập'
  | 'Đồ ký túc xá'
  | 'Thời trang'
  | 'Handmade'
  | 'Khác';

export type ProductCondition = 'Mới' | 'Như mới' | 'Đã sử dụng';
export type ProductStatus = 'active' | 'sold' | 'draft';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transaction'
  | 'completed'
  | 'cancelled'
  | 'rejected';
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
  rating?: number;
  reviewCount?: number;
  bio?: string;
  sellerSince?: string;
};

export type ProductImage = {
  uri: string;
  name: string;
  size?: number;
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
  images: string[];
  location: LocationPoint;
  meetupPoint?: string;
  allowsMeetup: boolean;
  allowsCod: boolean;
  status: ProductStatus;
  createdAt: string;
};

export type CartLine = {
  productId: string;
  quantity: number;
  selected: boolean;
};

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  condition?: string;
  variant?: string;
};

export type Order = {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  shippingFee: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryLocation: LocationPoint;
  note: string;
  createdAt: string;
  cancelReason?: string;
  cancelledAt?: string;
  completedAt?: string;
};

export type SavedAddress = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  building: string;
  room: string;
  location: LocationPoint;
  isDefault: boolean;
  notes: string;
};

export type NotificationType = 'order' | 'message' | 'other';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  icon: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
  offerLocation?: LocationPoint;
};

export type ChatThread = {
  id: string;
  participants: [string, string];
  productId: string;
  messages: ChatMessage[];
  updatedAt: string;
};

export type Review = {
  id: string;
  orderId: string;
  authorId: string;
  productId: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
};

export type ProductInput = Omit<
  Product,
  'id' | 'sellerId' | 'status' | 'createdAt'
>;
