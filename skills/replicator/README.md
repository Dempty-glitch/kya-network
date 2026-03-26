# kya-replicator-mcp

MCP Server cho KYA Network — cung cấp tính năng nhân bản agent cho **Claude Code và OpenClaw**.

---

## Tính năng

| Tool | Mô tả |
|------|-------|
| `register_birth` | Đăng ký agent mới vào KYA Network Registry → nhận Agent ID hierarchical |
| `fetch_install_guide` | Tải instruction cài OpenClaw mới nhất từ GitHub |

---

## Cài đặt

### Yêu cầu

- Node.js >= 20
- Claude Code hoặc OpenClaw agent

### Build từ source

```bash
cd kya-network/skills/replicator
npm install
npm run build
```

---

## Cấu hình MCP

### Claude Code

Thêm vào `~/.claude/claude_code_config.json` hoặc project MCP config:

```json
{
  "mcpServers": {
    "kya-replicator": {
      "command": "node",
      "args": ["/absolute/path/to/kya-network/skills/replicator/dist/index.js"]
    }
  }
}
```

### OpenClaw

Thêm vào `openclaw.json`:

```json
{
  "mcpServers": {
    "kya-replicator": {
      "command": "node",
      "args": ["/absolute/path/to/kya-network/skills/replicator/dist/index.js"]
    }
  }
}
```

> Sau khi thêm xong, restart OpenClaw gateway để MCP được load.

---

## Flow nhân bản

```
Agent A — Claude Code hoặc OpenClaw (có SSH tool)
  │
  ├─ 1. User nhờ cài bot mới
  ├─ 2. Agent A thu thập: IP VPS, Telegram token, API key, model
  ├─ 3. Agent A SSH vào VPS → cài OpenClaw (dùng fetch_install_guide)
  ├─ 4. Agent A gọi register_birth(parentId="ACN-000") → nhận agentId="ACN-000-001"
  ├─ 5. Ghi agentId vào openclaw.json của VPS mới
  └─ 6. Start OpenClaw → Agent B sống, biết parent của mình là ai
```

---

## Config

Sửa `config.json` để thay URL mà không cần rebuild:

```json
{
  "webhookUrl": "...",      // Google Apps Script URL
  "instructionUrl": "...",  // GitHub raw URL của install-openclaw.md
  "repoUrl": "..."          // GitHub repo URL
}
```

---

## Fallback behavior

| Tình huống | Hành vi |
|-----------|---------|
| Webhook fail / timeout | `register_birth` trả temp ID `ACN-TEMP-xxx`, ghi log |
| GitHub fail / offline | `fetch_install_guide` trả cached instruction |
| `openclaw.json` không tồn tại | `register_birth` dùng `parentId = "ACN"` (orphan) |

---

## GitHub

[kya-network](https://github.com/Dempty-glitch/kya-network)
