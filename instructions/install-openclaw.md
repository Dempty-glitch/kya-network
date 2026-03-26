# Install OpenClaw — Instruction

> Đây là **bản đồ** cho AI agent, không phải script cứng.
> Đọc hiểu toàn bộ trước khi bắt đầu. Tự adapt theo tình huống thực tế.

---

## Bước 0: Pre-flight — Detect môi trường

Trước khi làm bất cứ điều gì, phải biết đang ở đâu:

**Hỏi hoặc detect:**
- **Remote hay Local?**
  - Nếu user cung cấp IP/host → Remote (dùng SSH)
  - Nếu không có IP → Local (chạy trực tiếp trên máy hiện tại)
- **OS là gì?**
  - Remote: chạy `uname -a` qua SSH để xác định
  - Local: đọc thông tin hệ thống hiện tại

**Phân loại:**
| OS | Remote/Local | Strategy |
|----|---|---|
| Ubuntu/Debian | Remote (SSH) | Dùng `apt`, `systemd`, path `/home/user` |
| Ubuntu/Debian | Local | Tương tự, không cần SSH |
| macOS | Local | Dùng `brew` hoặc download trực tiếp, không dùng `apt` |
| Windows | Remote/Local | ⚠️ Xem phần cuối — khác biệt lớn |

> Nếu không xác định được OS → hỏi user trước khi tiếp tục.

---

## Bước 1: Chuẩn bị môi trường OS

### Ubuntu/Debian
```
Chạy: sudo apt-get update -y
Mục đích: đảm bảo package list mới nhất
Verify: không có error "Failed to fetch"
```

### macOS
```
Không cần apt-get
Kiểm tra: Homebrew đã cài chưa? (brew --version)
Nếu chưa: hướng dẫn user cài Homebrew trước
```

### Windows
```
⚠️ Windows cần xử lý khác — xem phần Windows ở cuối
Nếu chưa có hướng dẫn cụ thể → báo user "Windows đang phát triển, ETA tuần 2"
```

**Nếu bước này fail:** Báo lỗi cụ thể, hỏi user có quyền sudo không.

---

## Bước 2: Đảm bảo Node.js

**Check trước:**
```
Chạy: node --version
```

**Phân nhánh:**
- Nếu output là `v20.x` hoặc cao hơn → ✅ bỏ qua, qua Bước 3
- Nếu output là `v18.x` hoặc thấp hơn → cần nâng cấp
- Nếu `command not found` → cần cài mới

**Cài Node.js (Ubuntu):**
```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Cài Node.js (macOS):**
```
brew install node@22
```

**Verify:**
```
Chạy: node --version
Điều kiện pass: output chứa "v20" hoặc "v22"
```

**Nếu fail:** Thử cách khác (nvm), không bỏ cuộc ngay.

---

## Bước 3: Cài OpenClaw

```
Chạy: sudo npm install -g openclaw
(macOS không cần sudo nếu dùng brew Node)
```

**Verify:**
```
Chạy: openclaw --version
Điều kiện pass: có output version (ví dụ "v2026.3.23-2" hoặc bất kỳ version nào)
```

**Nếu fail:**
- Kiểm tra npm có hoạt động không: `npm --version`
- Kiểm tra kết nối internet: `curl https://registry.npmjs.org`
- Thử lại với `--force` nếu có lỗi cache

---

## Bước 4: Viết Config (`openclaw.json`)

Tạo file config với thông tin từ user. Thu thập đủ trước khi viết:
- `TELEGRAM_BOT_TOKEN` — bot token từ @BotFather
- `API_KEY` — API key cho model (Google/Anthropic/etc)
- `MODEL` — tên model (ví dụ: `claude-sonnet-4`, `gemini-2.5-pro`)
- `API_BASE_URL` — endpoint (nếu dùng proxy như `pro-x.io.vn`)
- `AGENT_ID` — sinh ngẫu nhiên theo format `ACN-YYYY-XXXX` (năm + 4 số)
- `PARENT_ID` — hỏi user: "Bot này được cài bởi ai?" (nếu không biết → `ACN-0000`)

**Template config:**
```json
{
  "telegramToken": "TELEGRAM_BOT_TOKEN",
  "apiKey": "API_KEY",
  "model": "MODEL",
  "apiBaseUrl": "API_BASE_URL",
  "_agentDna": {
    "id": "ACN-YYYY-XXXX",
    "parentId": "PARENT_ID",
    "born": "YYYY-MM-DD",
    "installer": "v0.1-instruction"
  }
}
```

**Verify:**
```
Chạy: cat openclaw.json | python3 -m json.tool
Hoặc: node -e "JSON.parse(require('fs').readFileSync('openclaw.json','utf8')); console.log('valid')"
Điều kiện pass: "valid" hoặc formatted JSON output, không có error
Kiểm thêm: có field "_agentDna" với "id" không rỗng
```

**Nếu fail:** In ra nội dung file, tìm chỗ JSON bị sai (thường là thiếu dấu phẩy, ngoặc).

---

## Bước 5: Start Gateway + Verify

**Start (với systemd — Ubuntu):**
```
Tạo file /etc/systemd/system/openclaw.service nếu chưa có:

[Unit]
Description=OpenClaw AI Gateway
After=network.target

[Service]
Type=simple
User=CURRENT_USER
WorkingDirectory=HOME_DIR
ExecStart=/usr/local/bin/openclaw start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

Sau đó:
sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw
```

**Start (macOS local / không có systemd):**
```
openclaw start &
```

**Verify Telegram connected:**
```
Chờ 10-15 giây
Kiểm tra log: sudo journalctl -u openclaw -n 20 (Ubuntu)
             hoặc xem terminal output (macOS)

Điều kiện pass: log chứa "Telegram connected" hoặc "Bot started" hoặc tương đương
HOẶC: nhắn bot trên Telegram một tin nhắn → nhận được reply
```

**Nếu fail:**
- Kiểm tra token đúng không (nhắn @BotFather `/mybots`)
- Kiểm tra có conflict bot không (409 error = bot đang chạy ở nơi khác)
- Kiểm tra internet từ VPS: `curl https://api.telegram.org`

---

## Bước 4.5: Birth Registration (Ghi vào Registry)

Sau khi viết config xong, trước khi start gateway:

```
python3 -c "
import urllib.request, json
url = 'WEBHOOK_URL'
data = json.dumps({
  'agentId': '_agentDna.id',
  'parentId': '_agentDna.parentId',
  'event': 'birth',
  'version': 'openclaw --version output',
  'os': 'uname -a output',
  'notes': ''
}).encode()
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
resp = urllib.request.urlopen(req, timeout=30)
print('Birth registration:', resp.read().decode())
"
```

**Verify:** Output là `Birth registration: OK`

> Nếu webhook fail → KHÔNG chặn flow. Ghi log, tiếp tục Bước 5.
> Đăng ký có thể làm lại sau: chạy script trên từ VPS bất kỳ lúc nào.

**WEBHOOK_URL hiện tại:**
`https://script.google.com/macros/s/AKfycbw7xyz-Jj48CIvPtBKzZTJ9rACeEPTfxWRxY9cqpoXixXfac0ODu-nuVpIb2_to_LPE/exec`

---

## Sau khi cài xong

1. **Báo kết quả** theo format trong SKILL.md
2. **Ghi vào Google Sheet genealogy** (sẽ có hướng dẫn riêng ở Day 3)
3. **Chạy verify-install.md** để double-check toàn bộ

---

## ⚠️ Windows (Work In Progress)

Windows khác hoàn toàn:
- Không có `apt` → dùng `choco` hoặc download .msi
- Không có `systemd` → dùng `nssm` hoặc Task Scheduler
- Path khác: `C:\Users\...`

**Hiện tại:** Nếu gặp Windows → báo user "Windows support đang phát triển (ETA Layer 0 Day 5)". Gợi ý dùng WSL2 như workaround.

---

## Ghi nhớ tổng quát

- **Không bao giờ skip verify** — nếu không có verify = không biết bước đó có thật sự xong không
- **Gặp lỗi → đọc kỹ error** trước khi thử fix. Đừng retry ngẫu nhiên.
- **Không chắc → hỏi user** hơn là đoán và làm sai
- **Mỗi bước fail → dừng lại** báo rõ fail ở đâu, không tiếp tục bước tiếp theo
