# Bảng đối chiếu 44 Artboard Stitch → Route Expo Router

Dự án Stitch: `projects/2327205381384374553` (Remix of UniLoop Student Marketplace UI/UX)

## Auth + Dùng chung (11)
| # | ScreenId | Tên | Route / Component |
|---|---|---|---|
| 1 | 8981a1b0 | Chào mừng (Onboarding) | `app/index.tsx` |
| 2 | 4a504b7d | Đăng nhập | `app/login.tsx` |
| 3 | 19902977 | Đăng ký | `app/register.tsx` |
| 4 | 236ae50f | Quên mật khẩu | `app/forgot-password.tsx` |
| 5 | 91f6277e | Nhập mã OTP | `app/otp.tsx` |
| 6 | 36fce5a1 | Đặt lại mật khẩu | `app/reset-password.tsx` |
| 7 | 722463cd | Đặt lại mật khẩu thành công | `app/reset-success.tsx` |
| 8 | 62f3d31a | Modal đăng xuất | component `src/components/ui/LogoutModal.tsx` (buyer profile + seller store) |
| 9 | ae7ea1b0 | Dữ liệu trống | component `src/components/ui/EmptyState.tsx` |
| 10 | b162e7e4 | Lỗi hệ thống | component `src/components/ui/ErrorView.tsx` |
| 11 | 8a3d6efb | Loading Skeleton | component `src/components/ui/Skeleton.tsx` |

## Người mua (20)
| # | ScreenId | Tên | Route |
|---|---|---|---|
| 12 | 9c270130 | Trang chủ | `app/(tabs)/(buyer)/index.tsx` |
| 13 | c631323e | Khám phá | `app/(tabs)/(buyer)/explore.tsx` |
| 14 | 6f5b8b72 | Tìm kiếm và lọc | `app/search.tsx` |
| 15 | bc6fc6b3 | Kết quả tìm kiếm | `app/search-results.tsx` |
| 16 | c4aef4b6 | Kết quả tìm kiếm trống | `app/search-results.tsx` (state rỗng) |
| 17 | 08229bb0 | Chi tiết sản phẩm | `app/product/[id].tsx` |
| 18 | c081094f | Sản phẩm yêu thích | `app/favorites.tsx` |
| 19 | 9595ae7c | Giỏ hàng | `app/cart.tsx` |
| 20 | a9a01e2c | Danh sách địa chỉ | `app/addresses.tsx` |
| 21 | 808fdd0c | Thêm / sửa địa chỉ | `app/address-form.tsx` |
| 22 | 5aecf5e6 | Thanh toán | `app/checkout.tsx` |
| 23 | 4a2de1a8 | Đặt hàng thành công | `app/order-success.tsx` |
| 24 | 9a614a1c | Đơn mua | `app/(tabs)/(buyer)/orders.tsx` |
| 25 | 7a2ef2c2 | Chi tiết đơn mua | `app/order/[id].tsx` |
| 26 | 152bb519 | Theo dõi đơn hàng | `app/order-tracking.tsx` |
| 27 | 860fb6a7 | Hủy đơn | `app/order-cancel.tsx` |
| 28 | 69d79aea | Đánh giá giao dịch | `app/order-rate.tsx` |
| 29 | 57bb58b7 | Thông báo | `app/(tabs)/(buyer)/notifications.tsx` |
| 30 | c420f535 | Danh sách trò chuyện (buyer) | `app/chats.tsx` |
| 31 | 00e1ebf3 | Cá nhân | `app/(tabs)/(buyer)/profile.tsx` |

## Người bán (10)
| # | ScreenId | Tên | Route |
|---|---|---|---|
| 32 | e84b0725 | Tổng quan | `app/(tabs)/(seller)/index.tsx` |
| 33 | aa78c2ce | Quản lý sản phẩm | `app/(tabs)/(seller)/products.tsx` |
| 34 | 541a4237 | Đăng sản phẩm | `app/(tabs)/(seller)/create.tsx` |
| 35 | e63bcf50 | Sửa sản phẩm | `app/product-form.tsx` |
| 36 | facdd934 | Xem trước bài đăng | `app/product-preview.tsx` |
| 37 | e0858134 | Đơn bán | `app/(tabs)/(seller)/orders.tsx` |
| 38 | 783dff1d | Chi tiết đơn bán | `app/seller-order/[id].tsx` |
| 39 | b286f46c | Thông báo (seller) | `app/seller-notifications.tsx` |
| 40 | ee52ef40 | Danh sách trò chuyện (seller) | `app/seller-chats.tsx` |
| 41 | 46990b4d | Cửa hàng | `app/(tabs)/(seller)/store.tsx` |

## Dùng chung - màn giao dịch (3)
| # | ScreenId | Tên | Route |
|---|---|---|---|
| 42 | 968454ea | Chi tiết trò chuyện | `app/chat/[id].tsx` |
| 43 | bb748ae3 | Bản đồ chọn vị trí | `app/map.tsx` |
| 44 | 51d34aa2 | Báo cáo vi phạm | `app/report.tsx` |
