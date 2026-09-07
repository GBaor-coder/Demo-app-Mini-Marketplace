# Push Code lên GitHub

## Remote hiện tại

| Remote | URL |
|--------|-----|
| origin | https://github.com/ngthithutrang-hoc/Mini-Marketplace.git |
| upstream | https://github.com/GBaor-coder/Demo-app-Mini-Marketplace.git |

## Các lệnh push

```bash
# Push lên origin (default)
git push origin main

# Push lên upstream
git push upstream main

# Push tất cả branch
git push upstream --all
```

## Các lệnh thường dùng

```bash
# Xem remote
git remote -v

# Thêm remote mới
git remote add <tên> <url>

# Xóa remote
git remote remove <tên>

# Pull từ upstream
git pull upstream main
```

## Workflow

1. Chỉnh sửa code
2. `git add .`
3. `git commit -m "message"`
4. `git push upstream main`
