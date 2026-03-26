# Verify Install — Checklist

> Chạy sau khi cài xong. Nếu bất kỳ mục nào fail → ghi nhận và báo cáo.

## Checklist

### 1. OpenClaw binary
```
node: openclaw --version
pass: có output version
fail: "command not found" hoặc error
```

### 2. Config valid
```
node -e "JSON.parse(require('fs').readFileSync('openclaw.json','utf8')); console.log('OK')"
pass: in ra "OK"
fail: SyntaxError
```

### 3. Agent DNA tồn tại
```
node -e "const c=JSON.parse(require('fs').readFileSync('openclaw.json','utf8')); console.log(c._agentDna?.id || 'MISSING')"
pass: in ra "ACN-YYYY-XXXX" (không phải MISSING)
fail: in ra "MISSING" hoặc undefined
```

### 4. Service running (Ubuntu với systemd)
```
systemctl is-active openclaw
pass: "active"
fail: "inactive" / "failed"
```

### 5. Telegram connected
```
Nhắn bot tin nhắn bất kỳ (ví dụ: "hello")
pass: bot reply trong vòng 30 giây
fail: không có reply sau 1 phút
```

## Kết quả

Tổng kết theo format:
```
Verify Results:
[✅/❌] openclaw binary
[✅/❌] config JSON valid
[✅/❌] Agent DNA present (ID: ACN-XXXX)
[✅/❌] service running
[✅/❌] Telegram connected

Score: X/5
Status: PASS (5/5) / PARTIAL (3-4/5 — ghi rõ cái nào fail) / FAIL (<3/5)
```
