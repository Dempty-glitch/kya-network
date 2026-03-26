---
name: install-openclaw
description: "Cài đặt OpenClaw lên bất kỳ môi trường nào (VPS Ubuntu, macOS local, Windows). Agent tự detect OS, tự adapt, tự verify. Không cần can thiệp thủ công."
---

# Skill: install-openclaw

## Khi nào dùng skill này?
User yêu cầu: "cài OpenClaw", "setup bot", "tạo agent mới", "cài lên VPS" hoặc tương đương.

## Entry Point

Đọc và thực thi file `install-openclaw.md` trong cùng thư mục này.

Sau khi cài xong, chạy verify theo `verify-install.md`.

## Output cuối cùng

Báo cáo ngắn gọn:
```
✅ OpenClaw installed successfully
Agent ID: ACN-XXXX
Telegram: connected
Time: X phút
```

Hoặc nếu fail:
```
❌ Failed at step [N]: [tên step]
Error: [chi tiết lỗi]
Next: [hướng xử lý]
```
