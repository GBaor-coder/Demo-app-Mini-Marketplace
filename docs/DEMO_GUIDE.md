# Kịch bản demo UniLoop

## 1. Luồng người bán

1. Tại màn hình đăng nhập, chọn vai trò **Người bán** trên segmented control.
2. Đăng nhập bằng `seller@uniloop.vn` / `seller123` (hoặc bấm **Dùng thử vai trò
   Người bán** để vào ngay).
3. Xem tab **Tổng quan**: số sản phẩm đang bán, đơn chờ xác nhận và doanh thu.
4. Mở tab **Đăng bán**, chọn ảnh, nhập thông tin và nhấn biểu tượng định vị.
5. Kéo ghim trên bản đồ đến điểm hẹn rồi đăng sản phẩm.
6. Quay lại tab **Sản phẩm** để sửa, đánh dấu đã bán hoặc xóa sản phẩm.
7. Tab **Cửa hàng** hiển thị cửa hàng công khai giống góc nhìn người mua.

## 2. Luồng người mua

1. Đăng xuất và đăng nhập lại với vai trò **Người mua** (`buyer@uniloop.vn` /
   `buyer123`) hoặc dùng nút **Dùng thử vai trò Người mua**.
2. Tìm kiếm sản phẩm không dấu, chọn danh mục và mở trang chi tiết.
3. Kiểm tra người bán, vị trí trên bản đồ và thêm sản phẩm vào giỏ.
4. Trong giỏ hàng, tăng/giảm số lượng để kiểm tra giới hạn tồn kho.
5. Checkout, chọn nhận trực tiếp hoặc COD, dùng GPS để chọn địa chỉ.
6. Đặt hàng và xem trạng thái tại tab **Đơn mua**.

## 3. Hoàn tất giao dịch

1. Đăng nhập lại tài khoản người bán.
2. Mở tab **Đơn bán**, xác nhận đơn vừa tạo.
3. Chuyển đơn sang **Đã giao** để hoàn tất quy trình.
4. Quan sát doanh thu hoàn tất trên tab **Tổng quan**.

## 4. Luồng quên mật khẩu (demo)

1. Trên màn hình đăng nhập bấm **Quên mật khẩu**.
2. Nhập email và nhấn **Gửi mã** → chuyển sang màn hình nhập OTP (6 số, có đếm
   giờ và gửi lại mã).
3. Nhập mã OTP rồi **Tiếp tục** → đặt mật khẩu mới (ít nhất 8 ký tự, có chữ hoa
   và số).
4. Xem thông báo **Đặt lại mật khẩu thành công** rồi quay về đăng nhập.

## Kiểm tra nhanh trước khi thuyết trình

- Bật GPS và cấp quyền vị trí/ảnh cho Expo Go.
- Bảo đảm điện thoại hoặc emulator có kết nối mạng để tải ảnh mẫu và bản đồ.
- Dùng **Khôi phục dữ liệu mẫu** trong Tài khoản nếu cần demo lại từ đầu.
- Khởi động bằng `npx expo start -c` để tránh cache cũ.
