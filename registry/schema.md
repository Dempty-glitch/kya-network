# Agent Registry Schema

## Google Sheet Columns

| Column | Field | Description |
|--------|-------|-------------|
| A | `timestamp` | ISO 8601 timestamp from Google server |
| B | `agentId` | Agent identity: `ACN-YYYY-XXXX` |
| C | `parentId` | Who installed this agent |
| D | `event` | Event type: `birth`, `heartbeat`, `death` |
| E | `version` | OpenClaw version string |
| F | `os` | Operating system info |
| G | `notes` | Free-text notes |

## Events

| Event | When | Frequency |
|-------|------|-----------|
| `birth` | Agent first installed | Once |
| `heartbeat` | Agent confirms alive | Future (when needed) |
| `death` | Agent decommissioned | Once |
