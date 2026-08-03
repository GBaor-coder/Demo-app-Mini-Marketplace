# Kịch bản demo UniLoop

## 1. Luồng người bán

1. Chọn vai trò **Người đăng bán** tại màn hình đăng nhập.
2. Đăng nhập bằng `seller@uniloop.vn` / `seller123`.
3. Xem dashboard, số sản phẩm đang bán và đơn chờ xác nhận.
4. Mở tab **Đăng bán**, chọn ảnh, nhập thông tin và nhấn biểu tượng định vị.
5. Kéo ghim trên bản đồ đến điểm hẹn rồi đăng sản phẩm.
6. Quay lại **Kênh bán** để sửa, đánh dấu đã bán hoặc xóa sản phẩm.

## 2. Luồng người mua

1. Đăng xuất và chọn vai trò **Người mua**.
2. Đăng nhập bằng `buyer@uniloop.vn` / `buyer123`.
3. Tìm kiếm sản phẩm không dấu, chọn danh mục và mở trang chi tiết.
4. Kiểm tra người bán, vị trí trên bản đồ và thêm sản phẩm vào giỏ.
5. Trong giỏ hàng, tăng/giảm số lượng để kiểm tra giới hạn tồn kho.
6. Checkout, chọn nhận trực tiếp hoặc COD, dùng GPS để chọn địa chỉ.
7. Đặt hàng và xem trạng thái tại tab **Đơn mua**.

## 3. Hoàn tất giao dịch

1. Đăng nhập lại tài khoản người bán.
2. Mở **Đơn bán**, xác nhận đơn vừa tạo.
3. Chuyển đơn sang **Đã giao** để hoàn tất quy trình.
4. Quan sát doanh thu hoàn tất trên dashboard.

## Kiểm tra nhanh trước khi thuyết trình

- Bật GPS và cấp quyền vị trí/ảnh cho Expo Go.
- Bảo đảm điện thoại hoặc emulator có kết nối mạng để tải ảnh mẫu và bản đồ.
- Dùng **Khôi phục dữ liệu mẫu** trong Tài khoản nếu cần demo lại từ đầu.
- Khởi động bằng `npx expo start -c` để tránh cache cũ.
