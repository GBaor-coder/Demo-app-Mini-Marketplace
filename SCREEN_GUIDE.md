# QUY ƯỚC VIẾT SCREEN (CHO AGENT) — UniLoop Rebuild

Dự án: `D:\LẬP TRÌNH MOBILE\Final Mobile\Mini-Marketplace` (Expo Router + React Native, TypeScript).

## NGUỒN THIẾT KẾ (DUY NHẤT)
3 SPEC trong `C:\Users\THUTRA~1\AppData\Local\Temp\opencode\specs\`:
- `auth-shared.md` — auth + dùng chung
- `buyer.md` — 20 màn người mua
- `seller-shared.md` — 10 màn người bán + chat/map/report dùng chung
Mỗi màn có đề mục `## MÀN X — TÊN` + `**File:** <id>.html` + mô tả DOM chi tiết (class Tailwind → convert sang StyleSheet). Bảng đối chiếu: `ARTBOARD_ROUTES.md` ở root dự án.

## BẮT BUỘC
1. **KHÔNG sửa** `src/context/store-context.tsx`, `src/types.ts`, `src/data/seed*`, `src/utils/format.ts`, `src/utils/filter.ts` — chỉ ĐỌC để dùng đúng API.
2. Icon = **MaterialIcons** (`@expo/vector-icons`), gọi qua `import { MaterialIcons } from '@/src/components/ui'`. KHÔNG dùng Ionicons.
3. Dùng theme tokens từ `@/src/theme/colors` — `colors`, `radius`, `shadow`, `typography`. KHÔNG hardcode màu/radius trừ khi spec yêu cầu cụ thể (vd `#E2E8F0` otp).
4. Dùng các shared components `src/components/ui/index.tsx`: `Button`, `Input`, `ScreenHeader`, `Chip`, `ProductCard`, `EmptyState`, `ErrorView`, `Skeleton`, `LogoutModal`, `SectionHeader`, `StatusBadge`, `IconButton`, `MaterialIcons`, `IconName`.
5. KHÔNG thêm comments. Bảo toàn logic hiện tại của từng screen (đọc file cũ trước khi sửa, giữ nguyên handlers/xử lý store), chỉ thay UI + icon theo spec.
6. Chạy `cmd /c npx tsc --noEmit` sau khi xong nhóm — chỉ quan tâm lỗi thuộc file bạn đang sửa.
7. Route KHÔNG đổi. `app/_layout.tsx` và 2 tab layout đã đúng.

## API SHARED COMPONENTS (tóm tắt)
- `Button`: `{ title, onPress, variant?: 'primary'|'primaryContainer'|'tonal'|'outline'|'ghost'|'danger', icon?, disabled?, loading?, size?: 'sm'|'md'|'lg', fullWidth?, style? }`. Không có prop `compact`. Height: sm=40/md=48/lg=56, bo mặc định radius.lg (16).
- `Input`: `{ label?, icon? (tên MaterialIcons), value, onChangeText, placeholder, error?, hint?, right? (ReactNode), boxRadius?, secureTextEntry?, ...TextInputProps }`. bo mặc định radius.lg.
- `PressableInput`: `{ label?, icon?, value?, placeholder?, error?, onPress, right? }`.
- `ScreenHeader`: `{ title?, showBack?, right?, transparent?, brand? }` — AppBar h-16.
- `Chip`: `{ label, selected?, onPress?, icon? }`.
- `ProductCard`: `{ product, onPress, compact? }` — dùng ảnh có sẵn từ product.
- `EmptyState`: `{ icon?, title, description?, action? }` — icon mặc định `database-off`.
- `ErrorView`: `{ title?, description?, onRetry? }` — nút Thử lại primary sm.
- `Skeleton`: `{ style? }` + `SkeletonCard` `{ style? }` — animate-pulse.
- `LogoutModal`: `{ visible, onClose, onConfirm }` — sheet/dialog chuẩn MÀN 8.
- `SectionHeader`: `{ title, action?, onPressAction? }`.
- `StatusBadge`: `{ status: string }` — tự map màu theo trạng thái đơn.
- `MaterialIcons`, `IconName` re-export.

## THEME TOKENS
- `radius`: sm=8, md=12, lg=16, xl=20, '2xl'=24, '3xl'=28, full=9999.
- `shadow`: level1..3, primary (blue glow), app.
- `typography`: displayLg, displayLgMobile, headlineMd, headlineSm, headlineMdMobile, headlineSmMobile, titleMd, bodyLg, bodyMd, bodySm, labelMd, labelSm, button.
- `colors`: primary #004ac6, primaryContainer #2563eb, onPrimary #fff, onPrimaryContainer #eeefff, background #f8f9ff, surface #f8f9ff, onSurface #0b1c30, onSurfaceVariant #434655, surfaceContainerLowest #ffffff, surfaceContainerLow #eff4ff, surfaceContainer #e5eeff, surfaceContainerHigh #dce9ff, surfaceContainerHighest #d3e4fe, surfaceBright #ffffff, outline #737686, outlineVariant #c3c6d7, error #ba1a1a, errorContainer #ffdad6, onError #fff, tertiary #006229, tertiaryContainer #007e37, onTertiaryContainer #c1ffc5, surfaceVariant #e5eeff, star #F59E0B.

## STYLE MẪU (auth đã viết xong — tham khảo)
`app/login.tsx`, `app/register.tsx`, `app/forgot-password.tsx`, `app/otp.tsx`, `app/reset-password.tsx`, `app/reset-success.tsx`, `app/index.tsx`, `app/role-select.tsx`.

## STORE CONTEXT API (đọc thêm nếu cần trong từng screen)
`useStore()` trả về toàn bộ state + actions (user, role, products, cart, orders, favorites, addresses, chat, notifications, seller metrics...). Đọc `src/context/store-context.tsx` để biết chính xác.
