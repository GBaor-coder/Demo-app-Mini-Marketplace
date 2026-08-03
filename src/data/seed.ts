import { LocationPoint, Order, Product, ProductCategory, User } from '@/src/types';

export const CATEGORIES: ProductCategory[] = [
  'Sách cũ',
  'Đồ học tập',
  'Điện tử nhỏ',
  'Đồ ký túc xá',
  'Handmade',
];

export const DEFAULT_LOCATION: LocationPoint = {
  latitude: 10.762622,
  longitude: 106.660172,
  address: 'Khu vực Đại học Bách Khoa, Quận 10, TP.HCM',
};

export const DEMO_USERS: User[] = [
  {
    id: 'buyer-1',
    name: 'Nguyễn Thu Trang',
    email: 'buyer@uniloop.vn',
    password: 'buyer123',
    role: 'buyer',
    phone: '0901 234 567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    campus: 'Đại học Bách Khoa TP.HCM',
    verified: true,
  },
  {
    id: 'seller-1',
    name: 'Trần Minh Anh',
    email: 'seller@uniloop.vn',
    password: 'seller123',
    role: 'seller',
    phone: '0938 456 789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    campus: 'Đại học Bách Khoa TP.HCM',
    verified: true,
  },
  {
    id: 'seller-2',
    name: 'Linh Handmade',
    email: 'linh@uniloop.vn',
    password: 'linh123',
    role: 'seller',
    phone: '0912 889 911',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    campus: 'Đại học Khoa học Tự nhiên TP.HCM',
    verified: true,
  },
];

const sellerLocation: LocationPoint = {
  latitude: 10.772178,
  longitude: 106.657913,
  address: 'Cổng Lý Thường Kiệt, Đại học Bách Khoa, Quận 10',
};

const dormLocation: LocationPoint = {
  latitude: 10.87564,
  longitude: 106.80039,
  address: 'Ký túc xá Khu B, ĐHQG TP.HCM, TP. Thủ Đức',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'product-1',
    sellerId: 'seller-1',
    title: 'Giáo trình Kinh tế vi mô',
    description:
      'Sách còn sạch, không rách, có ghi chú bằng bút chì ở một vài chương. Phù hợp sinh viên năm nhất.',
    price: 85000,
    category: 'Sách cũ',
    condition: 'Tốt',
    stock: 2,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900',
    location: sellerLocation,
    status: 'active',
    createdAt: '2026-07-28T08:30:00.000Z',
  },
  {
    id: 'product-2',
    sellerId: 'seller-1',
    title: 'Máy tính Casio FX-580VN X',
    description:
      'Máy hoạt động ổn định, phím còn nhạy, kèm nắp bảo vệ. Có thể kiểm tra trực tiếp trước khi nhận.',
    price: 420000,
    category: 'Đồ học tập',
    condition: 'Như mới',
    stock: 1,
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900',
    location: sellerLocation,
    status: 'active',
    createdAt: '2026-07-27T10:15:00.000Z',
  },
  {
    id: 'product-3',
    sellerId: 'seller-1',
    title: 'Đèn bàn học chống cận',
    description:
      'Ba mức sáng, cổng sạc USB, chân đèn chắc chắn. Thanh lý do chuyển phòng trọ.',
    price: 150000,
    category: 'Đồ ký túc xá',
    condition: 'Tốt',
    stock: 1,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900',
    location: sellerLocation,
    status: 'active',
    createdAt: '2026-07-25T15:20:00.000Z',
  },
  {
    id: 'product-4',
    sellerId: 'seller-1',
    title: 'Bàn phím Bluetooth nhỏ gọn',
    description:
      'Kết nối tốt với laptop, máy tính bảng và điện thoại. Pin dùng khoảng một tuần.',
    price: 260000,
    category: 'Điện tử nhỏ',
    condition: 'Đã qua sử dụng',
    stock: 1,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900',
    location: sellerLocation,
    status: 'active',
    createdAt: '2026-07-24T09:00:00.000Z',
  },
  {
    id: 'product-5',
    sellerId: 'seller-2',
    title: 'Túi tote canvas thêu tay',
    description:
      'Túi canvas dày, họa tiết thêu thủ công, có ngăn nhỏ bên trong. Có thể đặt màu theo yêu cầu.',
    price: 145000,
    category: 'Handmade',
    condition: 'Như mới',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1597633125097-5a9961e1f03d?w=900',
    location: dormLocation,
    status: 'active',
    createdAt: '2026-07-29T07:45:00.000Z',
  },
  {
    id: 'product-6',
    sellerId: 'seller-2',
    title: 'Nồi cơm điện mini 1.2L',
    description:
      'Kích thước phù hợp phòng ký túc xá, đủ cho 1-2 người. Lòng nồi chống dính còn tốt.',
    price: 330000,
    category: 'Đồ ký túc xá',
    condition: 'Tốt',
    stock: 1,
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=900',
    location: dormLocation,
    status: 'active',
    createdAt: '2026-07-23T12:10:00.000Z',
  },
  {
    id: 'product-7',
    sellerId: 'seller-2',
    title: 'Tai nghe chụp tai Bluetooth',
    description:
      'Âm thanh rõ, đệm tai mềm, sạc Type-C. Tặng kèm túi đựng chống bụi.',
    price: 390000,
    category: 'Điện tử nhỏ',
    condition: 'Tốt',
    stock: 2,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
    location: dormLocation,
    status: 'active',
    createdAt: '2026-07-22T16:30:00.000Z',
  },
  {
    id: 'product-8',
    sellerId: 'seller-1',
    title: 'Bộ bút highlight 6 màu',
    description: 'Màu pastel dịu mắt, đầu bút còn mới. Bán theo bộ 6 cây như hình.',
    price: 48000,
    category: 'Đồ học tập',
    condition: 'Như mới',
    stock: 3,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900',
    location: sellerLocation,
    status: 'active',
    createdAt: '2026-07-21T08:00:00.000Z',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'UL240701',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    items: [
      {
        productId: 'product-1',
        title: 'Giáo trình Kinh tế vi mô',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900',
        price: 85000,
        quantity: 1,
      },
    ],
    shippingFee: 0,
    total: 85000,
    status: 'completed',
    deliveryMethod: 'meetup',
    deliveryLocation: DEFAULT_LOCATION,
    note: 'Nhận tại cổng trường sau 17 giờ.',
    createdAt: '2026-07-20T10:00:00.000Z',
  },
];
