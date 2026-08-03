# UniLoop - Chợ xanh sinh viên

Ứng dụng mini marketplace dành cho sinh viên mua bán sách cũ, đồ học tập, đồ
điện tử nhỏ, đồ dùng ký túc xá và sản phẩm handmade trong phạm vi trường/khu trọ.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Người mua | `buyer@uniloop.vn` | `buyer123` |
| Người đăng bán | `seller@uniloop.vn` | `seller123` |

Màn hình đăng nhập có nút chọn vai trò và tự điền tài khoản tương ứng.

## Chạy dự án

Yêu cầu Node.js LTS và ứng dụng Expo Go tương thích Expo SDK 54.

```bash
npm install
npx expo start -c
```

Quét QR bằng Expo Go hoặc nhấn `a` để mở Android Emulator. Khi dùng bản đồ trên
emulator, cần bật Location và thiết lập một vị trí mô phỏng trong Android Studio.

## Chức năng người mua

- Danh sách sản phẩm dạng lưới, tìm kiếm tiếng Việt không dấu và lọc danh mục.
- Chi tiết sản phẩm, người bán xác thực và bản đồ điểm hẹn.
- Yêu thích, giỏ hàng, tăng/giảm số lượng và tính tổng tiền.
- Checkout nhận trực tiếp hoặc giao COD, GPS và ghim vị trí chính xác.
- Tự tách đơn theo người bán và theo dõi trạng thái đơn mua.

## Chức năng người đăng bán

- Dashboard thống kê tin đăng, đơn chờ và doanh thu hoàn tất.
- Đăng sản phẩm từ thư viện ảnh hoặc camera.
- Chọn điểm hẹn bằng GPS, chạm bản đồ hoặc kéo ghim.
- Sửa, xóa, quản lý tồn kho và đánh dấu đã bán.
- Xác nhận, từ chối và hoàn tất đơn của người mua.

## Dữ liệu và bản đồ

Phiên bản nộp bài dùng AsyncStorage để hoạt động ngay mà không cần khóa backend.
Đây là cơ chế demo, không phải cách lưu mật khẩu cho môi trường production.

`react-native-maps` hoạt động trực tiếp trong Expo Go. Nếu build APK/AAB độc lập
để phát hành, cần cấu hình Google Maps API key theo tài liệu Expo trước khi build.

## Cấu trúc chính

```text
app/                 Màn hình và điều hướng Expo Router
src/components/      Component giao diện, form sản phẩm và bản đồ
src/context/         Store nghiệp vụ và lưu dữ liệu cục bộ
src/data/            Tài khoản, sản phẩm và đơn hàng mẫu
src/theme/           Màu sắc dùng chung
src/types/           Kiểu dữ liệu TypeScript
src/utils/           Định dạng tiền, ngày và tìm kiếm
```
