# Agent Registry Schema

## ID Format

Hierarchical path-based. Each segment = 3 chars (base36: 0-9, A-Z).

```
ACN-000              Gen 0 (founder)
ACN-000-000          Gen 1 (child of 000)
ACN-000-000-001      Gen 2 (grandchild)
ACN-001              Gen 0 (second founder / orphan)
```

- **parentId** = ID bỏ segment cuối. Ví dụ: parent of `ACN-000-001` = `ACN-000`
- **Generation** = số segments - 1. Ví dụ: `ACN-000-001` = Gen 2
- **Server sinh ID** — agent chỉ gửi parentId, server trả về ID mới

## Google Sheet Columns

| Column | Field | Description |
|--------|-------|-------------|
| A | `timestamp` | ISO 8601 from Google server |
| B | `agentId` | Server-generated hierarchical ID |
| C | `parentId` | Parent agent ID (hoặc "ACN" nếu orphan) |
| D | `event` | `birth`, `heartbeat`, `death` |
| E | `generation` | Auto-calculated from ID depth |
| F | `version` | OpenClaw version |
| G | `os` | OS info |
| H | `notes` | Free text |

## API

**POST** to webhook URL:
```json
{
  "parentId": "ACN-000",
  "event": "birth",
  "version": "2026.3.24",
  "os": "Ubuntu 24.04",
  "notes": ""
}
```

**Response:**
```json
{
  "agentId": "ACN-000-000",
  "status": "ok",
  "generation": 1
}
```
